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
    const responses = firestore.collection("requests").doc(`${request._id}`).collection("responses").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            doc.ref.delete();
        });
    });
    await Promise.all([responses,firestore.collection("requests").doc(`${request._id}`).delete(),firestore.collection("User").doc(`${response.worker}`).collection("orders").doc(`${result._id}`).set(result.toJSON()),firestore.collection("User").doc(`${data.customer}`).collection("orders").doc(`${result._id}`).set(result.toJSON())]);
    return res.status(201).json({
        message: "Order created successfully!",
    });
    
}
async function getAllOrders(req, res) {
    const query = req.user.role === 'CUSTOMER' ? { customer: req.user._id, payment_status: { $ne: "PAID" } } : { worker: req.user._id };
    const orders = await Order.find(query);
    const data = [];
    if (!orders) {
        return res.status(404).json({
            message: "Orders not found!",
        });
    }

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        
        await Promise.all([order.populate('request'), order.populate('worker'), order.populate('response'),order.populate('customer')]); 
        data[i] = {
            "_id": order._id,
            "status": order.status,
            "description": order.request.description,
            "time": order.request.time,
            "worker": order.worker.name,
            "category": order.request.category,
            "address": order.request.address,
            "location": order.request.location,
            "customer": order.customer.name,
            "ratings": order.response.ratings,
            "work_type": order.request.work_type,
            "orders": order.response.orders,
            "worker_profile": order.worker.profile,
        };
        
    }
    return res.status(200).json(data);
}

async function getSingleOrder(req, res) {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "Order not found!",
        });
    }
    await Promise.all([order.populate('request'), order.populate('worker'), order.populate('response'),order.populate('customer')]); 
    const data = {
        "_id": order._id,
        "status": order.status,
        "description": order.request.description,
        "time": order.request.time,
        "worker": order.worker.name,
        "category": order.request.category,
        "address": order.request.address,
        "location": order.request.location,
        "customer": order.customer.name,
        "ratings": order.response.ratings,
        "work_type": order.request.work_type,
        "orders": order.response.orders,
        "worker_profile": order.worker.profile,
    };
    return res.status(200).json(data);
}

async function cancelOrder(req,res) {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        $set: {
            status: "CANCELLED",
        },
    });
    await firestore.collection("User").doc(`${req.user.role==="CUSTOMER"?order.worker:order.customer}`).collection("orders").doc(`${order._id}`).update({"status": "CANCELLED"});
    return res.status(200).json({ message: "Order cancelled successfully!" });
}

async function completeOrder(req,res) {
    const schema = yup.object().shape({
        price: yup.number().required().min(1),
    });
    try{
        await schema.validate(req.body);
    }
    catch(error){
        return res.status(400).json({
            message: error.message,
        });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, {
        $set: {
            status: "COMPLETED",
            price: req.body.price
        },
    });
    await firestore.collection("User").doc(`${order.customer}`).collection("orders").doc(`${order._id}`).update({"status": "COMPLETED","price": req.body.price});
    return res.status(200).json({ message: "Order completed successfully!" });
}

async function startedOrder(req,res) {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        $set: {
            status: "STARTED",
        },
    });
    await firestore.collection("User").doc(`${order.customer}`).collection("orders").doc(`${order._id}`).update({"status": "STARTED"});
    return res.status(200).json({ message: "Order started successfully!" });
    }

async function sentPayment(req,res){
    const order = await Order.findByIdAndUpdate(req.params.id,
        {
            $set: {
                payment_status: "SENT"
            }
        });
    await firestore.collection("User").doc(`${order.worker}`).collection("orders").doc(`${order._id}`).update({"payment_status": "SENT"});
    return res.status(200).json({ message: "Payment sent successfully!" });
}

async function paidPayment(req,res){
    const order = await Order.findByIdAndUpdate(req.params.id,
        {
            $set: {
                payment_status: "PAID"
            }
        });
    await firestore.collection("User").doc(`${order.customer}`).collection("orders").doc(`${order._id}`).update({"payment_status": "PAID"});
    return res.status(200).json({ message: "Payment paid successfully!" });
}
async function unpaidPayment(req,res){
    const order = await Order.findByIdAndUpdate(req.params.id,
        {
            $set: {
                payment_status: "UNPAID"
            }
        });
    await firestore.collection("User").doc(`${order.customer}`).collection("orders").doc(`${order._id}`).update({"payment_status": "UNPAID"});
    return res.status(200).json({ message: "Payment unpaid successfully!" });
}


module.exports = { createOrder, getAllOrders, cancelOrder, completeOrder, getSingleOrder, sentPayment, paidPayment, unpaidPayment, startedOrder };