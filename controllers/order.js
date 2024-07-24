const Order  = require("../models/Order");
const Request  = require("../models/Request");
const Response  = require("../models/Response");
const {firestore} = require("../conn.js");
const yup = require("yup");
async function createOrder(req, res) {
    if (!req.body) {
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }
    const schema = yup.object().shape({
        req_id: yup.string().required(),
        res_id: yup.string().required(),
    });
    try {
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
    const response = await Response.findById(req.body.res_id);
    const request = await Request.findByIdAndUpdate(req.body.req_id, {
        $set: {
            status: "COMPLETED",
        },
    });

    // const {request, response} = await Promise.all([requestpromise, responsepromise]);
    if (!response) {
        return res.status(404).json({
            message: "Response not found!",
        });
    }
    if (!request) {
        return res.status(404).json({
            message: "Request not found!",
        });
    }
    const data = {
        customer: req.user._id,
        worker: response.worker,
        request: request._id,
        response: response._id,
        work_type: request.work_type,
    };
    const order = new Order(data);
    const result = await order.save();

    await firestore.collection("Workers").doc(`${response.worker}`).collection("orders").doc(`${result._id}`).set(result.toJSON());
    return res.status(201).json({
        message: "Order created successfully!",
    });
    
}
async function getAllOrders(req, res) {
    const query = req.user.role === 'CUSTOMER' ? { customer: req.user._id } : { worker: req.user._id };
    const orders = await Order.find(query);
    return res.status(200).json(orders);
}

async function cancelOrder(req,res) {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        $set: {
            status: "CANCELLED",
        },
    });
    await firestore.collection("Workers").doc(`${order.worker}`).collection("orders").doc(`${order._id}`).set({"status": "CANCELLED"});
    return res.status(200).json({ message: "Order cancelled successfully!" });
}

async function completeOrder(req,res) {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        $set: {
            status: "COMPLETED"
        },
    });
    await firestore.collection("Workers").doc(`${order.worker}`).collection("orders").doc(`${order._id}`).set({"status": "COMPLETED"});
    return res.status(200).json({ message: "Order completed successfully!" });
}


module.exports = { createOrder, getAllOrders, cancelOrder, completeOrder };