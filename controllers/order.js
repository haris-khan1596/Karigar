const Order = require("../models/Order");
const Request = require("../models/Request");
const Response = require("../models/Response");
const { firestore } = require("../conn.js");
const yup = require("yup");
const log = require("../utils/logger");

async function createOrder(req, res) {
  log("info","Creating order");
  if (!req.body) {
    log("info","Content can not be empty in createOrder");
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
    log("error",error);
    return res.status(400).json({
      message: error.message,
    });
  }
  const response_prom =  Response.findById(req.body.res_id);
  const request_prom =  Request.findById(req.body.req_id);
  const req_res = await Promise.all([
    response_prom,
    request_prom,
  ]);
  const [response, request] = req_res;
  request.status = "COMPLETED";

  // const {request, response} = await Promise.all([requestpromise, responsepromise]);
  if (!response) {
    log("info","Response not found in createOrder");
    return res.status(404).json({
      message: "Response not found!",
    });
  }
  if (!request) {
    log("info","Request not found in createOrder");
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
  const responses = firestore
    .collection("requests")
    .doc(`${request._id}`)
    .collection("responses")
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        doc.ref.delete();
      });
    });
  // const responses = firestore.recursiveDelete(firestore.collection("requests").doc(`${request._id}`).collection("responses"));
  try {
    await Promise.all([
      order.save(),
      request.save(),
      responses,
      firestore.collection("requests").doc(`${request._id}`).delete(),
      firestore
        .collection("User")
        .doc(`${response.worker}`)
        .collection("orders")
        .doc(`${order._id}`)
        .set(order.toJSON()),
      firestore
        .collection("User")
        .doc(`${data.customer}`)
        .collection("orders")
        .doc(`${order._id}`)
        .set(order.toJSON()),
    ]);
    log("info","Order created successfully in createOrder");
  } catch (error) {
    log("error",error);
    return res.status(500).json({
      message: error.message,
    });
  }
  return res.status(201).json({
    message: "Order created successfully!",
  });
}
async function getAllOrders(req, res) {
  log("info","Fetching orders in getAllOrders");
  const orders = await Order.getAllOrders(req.user._id);
  if (!orders) {
    log("info","Orders not found in getAllOrders");
    return res.status(404).json({
      message: "Orders not found!",
    });
  }

  return res.status(200).json(orders);
}

async function getSingleOrder(req, res) {
  log("info","Fetching single order in getSingleOrder");
  try {
    const order = await Order.getSingleOrder(req.params.id);
    if (!order) {
      log("info","Order not found in getSingleOrder");
      return res.status(404).json({
        message: "Order not found!",
      });
    }
    log("info","Order fetched successfully in getSingleOrder");
    return res.status(200).json(order);
  } catch (error) {
    log("error",error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
}
async function updateOrder(req, res) {
  const order = await Order.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });
  if (!order) {
    log("info","Order not found in updateOrder");
    return res.status(404).json({
      message: "Order not found!",
    });
  }
  log("info","Order updated successfully in updateOrder");
  return res.status(200).json({ message: "Order updated successfully!" });
}
async function feedbackOrder(req, res) {
  const schema = yup.object().shape({
    rating: yup.number().required().min(1).max(5),
    feedback: yup.string().required(),
  });
  try {
    log("info","Validating feedback in feedbackOrder");
    await schema.validate(req.body);
  } catch (error) {
    log("error",error.message);
    return res.status(400).json({
      message: error.message,
    });
  }
  const order = await Order.findById(req.params.id);
  if (order.status !== "COMPLETED") {
    log("info","Order must be completed in feedbackOrder");
    return res.status(400).json({ message: "Order must be completed!" });
  }
  order.rating = req.body.rating;
  order.feedback = req.body.feedback;
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ rating: req.body.rating, feedback: req.body.feedback }),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ rating: req.body.rating, feedback: req.body.feedback }),
  ]);
  log("info","Order feedback successfully in feedbackOrder");
  return res.status(200).json({ message: "Order feedback successfully!" });
}
async function cancelOrder(req, res) {
  const schema = yup.object().shape({
    reason: yup.string().required(),
  });
  try {
    log("info","Validating reason in cancelOrder");
    await schema.validate(req.body);
  } catch (error) {
    log("error",error.message);
    return res.status(400).json({
      message: error.message,
    });
  }
  const order = await Order.findById(req.params.id);
  if (order.status === "STARTED") {
    log("info","Order already started in cancelOrder");
    return res.status(400).json({ message: "Order already started!" });
  }
  if (order.status === "COMPLETED") {
    log("info","Order already completed in cancelOrder");
    return res.status(400).json({ message: "Order already completed!" });
  }
  if (order.status === "CANCELLED") {
    log("info","Order already cancelled in cancelOrder");
    return res.status(400).json({ message: "Order already cancelled!" });
  }
  order.status = "CANCELLED";
  order.reason = req.body.reason;
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ status: "CANCELLED", reason: req.body.reason }),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ status: "CANCELLED", reason: req.body.reason }),
  ]);
  log("info","Order cancelled successfully in cancelOrder");
  return res.status(200).json({ message: "Order cancelled successfully!" });
}

async function completeOrder(req, res) {
  const schema = yup.object().shape({
    price: yup.number().required().min(1),
  });
  try {
    log("info","Validating price in completeOrder");
    await schema.validate(req.body);
  } catch (error) {
    log("error",error.message);
    return res.status(400).json({
      message: error.message,
    });
  }
  const order = await Order.findById(req.params.id);
  if (order.status === "COMPLETED") {
    log("info","Order already completed in completeOrder");
    return res.status(400).json({ message: "Order already completed!" });
  }
  if (order.status === "CANCELLED") {
    log("info","Order already cancelled in completeOrder");
    return res.status(400).json({ message: "Order already cancelled!" });
  }
  if (order.status === "PENDING") {
    log("info","Order must be started in completeOrder");
    return res.status(400).json({ message: "Order must be Started!" });
  }
  order.status = "COMPLETED";
  order.price = req.body.price;
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ status: "COMPLETED", price: req.body.price }),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ status: "COMPLETED", price: req.body.price }),
  ]);
  log("info","Order completed successfully in completeOrder");
  return res.status(200).json({ message: "Order completed successfully!" });
}

async function startedOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.status === "STARTED") {
    log("info","Order already started in startedOrder");  
    return res.status(400).json({ message: "Order already started!" });
  }
  if (order.status === "COMPLETED") {
    log("info","Order already completed in startedOrder");
    return res.status(400).json({ message: "Order already completed!" });
  }
  if (order.status === "CANCELLED") {
    log("info","Order already cancelled in startedOrder");
    return res.status(400).json({ message: "Order already cancelled!" });
  }
  order.status = "STARTED";
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ status: "STARTED" }),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ status: "STARTED" }),
  ]);
  log("info","Order started successfully in startedOrder");
  return res.status(200).json({ message: "Order started successfully!" });
}

async function sentPayment(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.payment_status === "PAID") {
    log("info","Payment already sent in sentPayment");
    return res.status(400).json({ message: "Payment already sent!" });
  }
  order.payment_status = "SENT";
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ payment_status: "SENT" }),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ payment_status: "SENT" }),
  ]);
  log("info","Payment sent successfully in sentPayment");
  return res.status(200).json({ message: "Payment sent successfully!" });
}

async function paidPayment(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.payment_status === "PAID") {
    log("info","Payment already paid in paidPayment");
    return res.status(400).json({ message: "Payment already paid!" });
  }
  order.payment_status = "PAID";
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ payment_status: "PAID" }),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ payment_status: "PAID" }),
  ]);
  log("info","Payment paid successfully in paidPayment");
  return res.status(200).json({ message: "Payment paid successfully!" });
}
async function unpaidPayment(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.payment_status === "UNPAID") {
    log("info","Payment already unpaid in unpaidPayment");  
    return res.status(400).json({ message: "Payment already unpaid!" });
  }
  if (order.payment_status === "PAID") {
    log("info","Payment already paid in unpaidPayment");
    return res.status(400).json({ message: "Payment already paid!" });
  }
  order.payment_status = "UNPAID";
  await Promise.all([
    order.save(),
    firestore
      .collection("User")
      .doc(`${order.customer}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ payment_status: "UNPAID" }),
    firestore
      .collection("User")
      .doc(`${order.worker}`)
      .collection("orders")
      .doc(`${order._id}`)
      .update({ payment_status: "UNPAID" }),
  ]);
  log("info","Payment unpaid successfully in unpaidPayment");
  return res.status(200).json({ message: "Payment unpaid successfully!" });
}

module.exports = {
  createOrder,
  getAllOrders,
  cancelOrder,
  completeOrder,
  getSingleOrder,
  sentPayment,
  paidPayment,
  unpaidPayment,
  startedOrder,
  feedbackOrder,
  updateOrder,
};
