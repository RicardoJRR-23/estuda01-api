const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  datePublished: {
    type: Date,
    default: Date.now()
  },
  link: {
    type: String, 
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema); 
