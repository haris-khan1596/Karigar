const mongoose = require('mongoose')

const WorkerDetailsSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    worker_type: {
        type: Array,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model('WorkerDetails', WorkerDetailsSchema)