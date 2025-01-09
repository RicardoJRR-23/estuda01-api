const mongoose = require('mongoose');

const StudyModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: { type: String },
    topics: [{
      name: String,
      content: String
    }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyModule', StudyModuleSchema); 