const mongoose = require('mongoose');


const RequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    work_type: {
        type: String,
        required: true,
        enum :["PLUMBER", "ELECTRICIAN", "CARPENTER", "MECHANIC", "PAINTER", "OTHER"]
    },
    category: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    location: {
        lat:{
            type: Number,
            required: true
        },
        long:{
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ["COMPLETED","CANCELED", "PENDING"],
        default: "PENDING"
    },
    // responseIds to track all response IDs related to this request
    responseIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response'
    }],
    
    // workerIds to track all worker IDs related to this request
    workerIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

RequestSchema.static('getTotalByStatus', async function(status) {
    const total = await this.aggregate([
        { $match: { status } },
        { $group: { _id: null, total: { $sum: 1 } } }])

    return total[0].total
})


module.exports = mongoose.model('Request', RequestSchema)