const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
  name: String,
  code: String,
  type: String,
  section: String,
  room: String,
  credits: String,
  teacherAssigned: String
});

module.exports = mongoose.model('Subject', subjectSchema);