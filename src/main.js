const express = require('express');
const app  = express();
const SubjectScript = require('./scripts/get_subjects');

require('dotenv').config();

app.post('/update-subjects', (req, res) => {
  if (!!req.query.key) {
    if(process.env.SECRET_KEY === req.query.key) {
      // Can execute the script
      SubjectScript.start();
      res.status(200);
      res.send({
        message: 'Script has started. You\'ll be notified when its complete.'
      });
    } else {
      // Sorry, you're not allowed
      res.status(401);
      res.send('Sorry, you\'re not allowd to execute this script.');
    }
  } else {
    // Bad request, please provide the authorization key
    res.status(400);
    res.send('Please, provide the authorization key');
  }
});

// connect to DB
require('./helpers/connect_db')

app.listen(process.env.PORT || 8700, () =>
  console.log('App started at port 8700')
);