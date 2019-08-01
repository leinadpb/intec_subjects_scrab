const puppeteer = require('puppeteer');
const QUERIES = require('../db/queries');

require('dotenv').config();

const baseURL = 'https://procesos.intec.edu.do';
const ofertaURL = 'https://procesos.intec.edu.do/OfertaAcademica/Index';

const start = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
    const page = await browser.newPage();
    await page.goto(baseURL);
    await page.waitForSelector('#txtID', { timeout: 1000 });

    const body = await page.evaluate((user, password) => {
      document.querySelector('#txtID').value = user;
      document.querySelector('#txtUserPass').value = password;
      let loginBtn = document.querySelector('#btnEntrar');
      loginBtn.click();
    }, process.env.INTEC_USER, process.env.INTEC_PASSWORD);
    
    setTimeout(async () => {
      await page.goto(ofertaURL);
      await page.waitForSelector('#content-oferta', { timeout: 1000 });

      const ofertaAcademica = await page.evaluate(() => {
        const areas = 5;
        let results = [];
        const unique = (value, index, self) => {
          return self.indexOf(value) === index
        }
        for(let i = 0; i < areas; i++) {
          const tbodyID = `ui-accordion-6-panel-${i}`;
          let tbody = document.querySelector(`#${tbodyID}`);
          let table = tbody.querySelector('tr td table');
          let tableChildren = table.children;
          for(let k = 1; k < tableChildren.length; k+=2) {
            // Get subject info
            let infos = tableChildren[k].querySelector('tr').children;
            let subjectTitle = infos[1].innerHTML;
            let subjectCredits = infos[2].innerHTML;
            
            // Get subject teachers
            const teachersTableIndex = k + 1;
            let rowResults = [];
            if (teachersTableIndex < tableChildren.length) {
              let rows = tableChildren[teachersTableIndex].querySelector('tr td table tbody').children;
              for(let j = 0; j < rows.length; j++) {
                let row = rows[j].children;
                let rowResult = {
                  type: row[0].innerText, // type
                  section: row[1].innerText, // seciton
                  room: row[2].innerText, // room
                  teacher: row[3].innerText
                }
                // GET SUBJECTS ONLY BEING IMPARTED IN THE FD4xx (wichc corresponds to the LABTI - INTEC)
                if(row[2].innerText.toString().toLowerCase().substr(0, 3) === "fd4") {
                  rowResults.push(rowResult);
                }
              }
            }

            results.push({
              subjectTitle: subjectTitle,
              subjectCredits: subjectCredits,
              teachers: rowResults.map(x => x.teacher).filter(unique),
            });
          }
        }
        return results;
      });

      // Save ofertaAcademica in MongoDB
      let updatedSubjects = ofertaAcademica.map(s => {
        return {
          name: s.subjectTitle,
          credits: s.subjectCredits,
          code: s.subjectTitle.substr(0, s.subjectTitle.indexOf(' ')),
          teacherAssigned: s.teachers.join(';')
        }
      })
      console.log(updatedSubjects);
      await QUERIES.removeAllSubjects();
      await QUERIES.addSubjects(updatedSubjects);
      // close browser
      await browser.close();
    }, 5000);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  start: () => start(),
};