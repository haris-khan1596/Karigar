const { createOrder, getAllOrders, cancelOrder, completeOrder } = require("../controllers/order");
const { isCustomer,isWorker} = require("../middlewares");

const router = require("express").Router();

router.post("/", isCustomer, createOrder);
router.get("/", getAllOrders);
router.put("/cancel/:id", isCustomer, cancelOrder);
router.put("/complete/:id", isWorker, completeOrder);

module.exports = router