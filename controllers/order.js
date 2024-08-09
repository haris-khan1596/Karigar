const Order = require("../models/Order");
const Request = require("../models/Request");
const Response = require("../models/Response");
const { firestore } = require("../conn.js");
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
  return res.status(201).json({
    message: "Order created successfully!",
  });
}
async function getAllOrders(req, res) {
  const orders = await Order.getAllOrders(req.user._id);
  if (!orders) {
    return res.status(404).json({
      message: "Orders not found!",
    });
  }

  return res.status(200).json(orders);
}

async function getSingleOrder(req, res) {
  const order = await Order.getSingleOrder(req.params.id);
  if (!order) {
    return res.status(404).json({
      message: "Order not found!",
    });
  }
  return res.status(200).json(order);
}
async function updateOrder(req, res) {
  const order = await Order.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });
  if (!order) {
    return res.status(404).json({
      message: "Order not found!",
    });
  }
  return res.status(200).json({ message: "Order updated successfully!" });
}
async function feedbackOrder(req, res) {
  const schema = yup.object().shape({
    rating: yup.number().required().min(1).max(5),
    feedback: yup.string().required(),
  });
  try {
    await schema.validate(req.body);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  const order = await Order.findById(req.params.id);
  if (order.status !== "COMPLETED") {
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
  return res.status(200).json({ message: "Order feedback successfully!" });
}
async function cancelOrder(req, res) {
  const schema = yup.object().shape({
    reason: yup.string().required(),
  });
  try {
    await schema.validate(req.body);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  const order = await Order.findById(req.params.id);
  if (order.status === "STARTED") {
    return res.status(400).json({ message: "Order already started!" });
  }
  if (order.status === "COMPLETED") {
    return res.status(400).json({ message: "Order already completed!" });
  }
  if (order.status === "CANCELLED") {
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
  return res.status(200).json({ message: "Order cancelled successfully!" });
}

async function completeOrder(req, res) {
  const schema = yup.object().shape({
    price: yup.number().required().min(1),
  });
  try {
    await schema.validate(req.body);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  const order = await Order.findById(req.params.id);
  if (order.status === "COMPLETED") {
    return res.status(400).json({ message: "Order already completed!" });
  }
  if (order.status === "CANCELLED") {
    return res.status(400).json({ message: "Order already cancelled!" });
  }
  if (order.status === "PENDING") {
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
  return res.status(200).json({ message: "Order completed successfully!" });
}

async function startedOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.status === "STARTED") {
    return res.status(400).json({ message: "Order already started!" });
  }
  if (order.status === "COMPLETED") {
    return res.status(400).json({ message: "Order already completed!" });
  }
  if (order.status === "CANCELLED") {
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
  return res.status(200).json({ message: "Order started successfully!" });
}

async function sentPayment(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.payment_status === "PAID") {
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
  return res.status(200).json({ message: "Payment sent successfully!" });
}

async function paidPayment(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.payment_status === "PAID") {
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
  return res.status(200).json({ message: "Payment paid successfully!" });
}
async function unpaidPayment(req, res) {
  const order = await Order.findById(req.params.id);
  if (order.payment_status === "UNPAID") {
    return res.status(400).json({ message: "Payment already unpaid!" });
  }
  if (order.payment_status === "PAID") {
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
