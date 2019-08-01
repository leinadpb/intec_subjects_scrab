const SubjectModel = require('../models/subject');

const addSubjects = (subjects) => {
  return SubjectModel.create(subjects, (err, doc) => {
    if (!!err) {
      console.log('Error creating student: ', err);
      return null;
    }
    return doc;
  });
}
const removeAllSubjects = () => {
  return SubjectModel.deleteMany({}, (err, doc) => {
    if (!!err) {
      console.log('Error creating student: ', err);
      return null;
    }
    return doc;
  });
}

module.exports = {
  addSubjects,
  removeAllSubjects,
}