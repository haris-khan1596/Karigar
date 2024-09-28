const log = require('../utils/logger');

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
        enum: ["COMPLETED","CANCELLED", "PENDING","STARTED"],
        default: "PENDING",
        required: true
    },
    price: {
        type: Number
    },
    reason: {
        type: String,
        required: function() {
            return this.status === "CANCELLED"
        }
    },
    work_type: {
        type: String,
        required: true,
        enum :["PLUMBER", "ELECTRICIAN", "CARPENTER", "MECHANIC", "PAINTER", "OTHER"]
    },
    feedback: {
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

OrderSchema.static('getAllOrders', async function(userId) {
    log('info', `Getting all orders for user ${userId}`);
    const agg = [
        {
          '$lookup': {
            'from': 'requests', 
            'localField': 'request', 
            'foreignField': '_id', 
            'as': 'request'
          }
        }, {
          '$match': {
            'request.0.time': {
              '$gt': new Date(
                new Date(Date.now() - 12 * 60 * 60 * 1000))
            }, 
            'payment_status': {
              '$ne': 'PAID'
            },
            '$or': [
              {
                'worker': new mongoose.Types.ObjectId(userId) 
              }, {
                'customer': new mongoose.Types.ObjectId(userId)
              }
            ]
          }
        }, {
          '$lookup': {
            'from': 'responses', 
            'localField': 'response', 
            'foreignField': '_id', 
            'as': 'response'
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'customer', 
            'foreignField': '_id', 
            'as': 'customer'
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'worker', 
            'foreignField': '_id', 
            'as': 'worker'
          }
        }
      ];
      
      const orders = await this.aggregate(agg);

      const data = [];
      for (let order of orders) {
        data.push({
          "_id": order._id,
          "status": order.status,
          "description": order.request[0].description,
          "price": order.price || 0,
          "time": order.request[0].time,
          "worker": order.worker[0].name,
          "category": order.request[0].category,
          "address": order.request[0].address,
          "location": order.request[0].location,
          "customer": order.customer[0].name,
          "ratings": order.response[0]?.ratings,
          "work_type": order.request[0].work_type,
          "orders": order.response[0]?.orders,
          "worker_profile": order.worker[0].profile,
        });
      }
      return data
})
OrderSchema.static('getSingleOrder', async function(id) {
    log('info', `Getting order with id ${id}`);
    const agg = [
        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(id),
            }
        },
        {
            '$lookup': {
                'from': 'requests',
                'localField': 'request',
                'foreignField': '_id',
                'as': 'request',
            }
        },
        {
            '$lookup': {
                'from': 'responses',
                'localField': 'response',
                'foreignField': '_id',
                'as': 'response',
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'customer',
                'foreignField': '_id',
                'as': 'customer',
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'worker',
                'foreignField': '_id',
                'as': 'worker',
            }
        }
    ];

    const order = await this.aggregate(agg);
    if (order.length === 0) {
        log('error', `Order with id ${id} not found`);
        return null
    }
    const data = {
            "_id": order[0]._id,
            "status": order[0].status,
            "description": order[0].request[0].description,
            "price": order[0].price || 0,
            "time": order[0].request[0].time,
            "worker": order[0].worker[0].name,
            "category": order[0].request[0].category,
            "address": order[0].request[0].address,
            "location": order[0].request[0].location,
            "customer": order[0].customer[0].name,
            "ratings": order[0].response[0]?.ratings,
            "work_type": order[0].request[0].work_type,
            "orders": order[0].response[0]?.orders,
            "worker_profile": order[0].worker[0].profile,
        };
    return data
    });
OrderSchema.static('getTotalByStatus', async function(status) {
    log('info', `Getting total by status ${status}`);
    const total = await this.aggregate([
        { $match: { status } },
        { $group: { _id: null, total: { $sum: '$price' } } }])

    return total[0].total
});

OrderSchema.static('getTotalByWorker', async function(worker) {
    log('info', `Getting total by worker ${worker}`);
    const total = await this.aggregate([
        { $match: { worker } },
        { $group: { _id: null, total: { $sum: '$price' } } }])

    return total[0].total
})
OrderSchema.static('getTotalOrdersByWorker', async function(worker) {
    log('info', `Getting total orders by worker ${worker}`);
    const total = await this.aggregate([
        { $match: { worker } },
        { $group: { _id: null, total: { $sum: 1 } } }])

    return total[0].total
});

OrderSchema.static('getWorkerStats', async function(worker) {
    log('info', `Getting worker stats for worker ${worker}`);
    try {
        const total = await this.aggregate([
            { $match: { worker } },
            { $group: { _id: null, orders: { $sum: 1 }, star: { $avg: '$rating' } } }
        ]);

        if (total.length > 0) {
            return { orders: total[0].orders, star: total[0].star };
        } else {
            return { orders: 0, star: 0 }; // or any other default values
        }
    } catch (err) {
        console.error(err);
        throw new Error('Failed to get worker stats');
    }
});
OrderSchema.static('getTotalOrdersByCustomer', async function(customer) {
    log('info', `Getting total orders by customer ${customer}`);
    const total = await this.aggregate([
        { $match: { customer } },
        { $group: { _id: null, total: { $sum: 1 } } }])

    return total[0].total
})

OrderSchema.static('getRatingWorker', async function(worker) {
    log('info', `Getting rating for worker ${worker}`);
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

