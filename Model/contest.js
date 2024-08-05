const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  combineId: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      fullname: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        default: 0
      }
    }
  ]
});

module.exports = mongoose.model('Contest', contestSchema);
