const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    response: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response',
        required: true
    },
    status: {
        type: String,
        enum: ["COMPLETED","CANCELED", "PENDING"],
        default: "PENDING",
        required: true
    },
    price: {
        type: Number
    },
    reason: {
        type: String,
        required: function() {
            return this.status === "CANCELED"
        }
    },
    work_type: {
        type: String,
        required: true,
        enum :["PLUMBER", "ELECTRICIAN", "CARPENTER", "MECHANIC", "PAINTER", "OTHER"]
    },
    comment: {
        type: String,
        required: function() {
            return this.rating>0 && this.rating<5 && this.status === "COMPLETED" && this.payment_status === "PAID"
        }
    },
    rating: {
        type: Number
    },
    payment_status: {
        type: String,
        enum: ["SENT","PAID","UNPAID"],
        default: "UNPAID"
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

OrderSchema.static('getTotalByStatus', async function(status) {
    const total = await this.aggregate([
        { $match: { status } },
        { $group: { _id: null, total: { $sum: '$price' } } }])

    return total[0].total
})

OrderSchema.static('getTotalByWorker', async function(worker) {
    const total = await this.aggregate([
        { $match: { worker } },
        { $group: { _id: null, total: { $sum: '$price' } } }])

    return total[0].total
})

OrderSchema.static('getRatingWorker', async function(worker) {
    const total = await this.aggregate([
        { $match: { worker } },
        { $group: { _id: null, total: { $avg: '$rating' } } }])

    return total[0].total
})

OrderSchema.methods.toJSON = function () {
    const order = this.toObject();
    delete order.__v;
    order._id = order._id.toString();
    order.request = order.request.toString();
    order.response = order.response.toString();
    order.customer = order.customer.toString();
    order.worker = order.worker.toString();
    return order;
}

module.exports = mongoose.model('Order', OrderSchema)