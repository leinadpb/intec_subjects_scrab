const mongoose = require('mongoose');
require('dotenv').config();
console.log(process.env.CONNECTION_STRING);
const db = process.env.CONNECTION_STRING;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.log(err);
    console.log('MongoDB Not Connected');
  });