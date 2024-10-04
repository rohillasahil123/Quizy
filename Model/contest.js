const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id; // Remove the _id field
      return ret;
    }
  }
});

const contestSchema = new mongoose.Schema({
  combineId: [participantSchema],
}, {
  toJSON: {
    virtuals: true, // Include virtuals if any are used
  }
});

module.exports = mongoose.model('Contest', contestSchema);
