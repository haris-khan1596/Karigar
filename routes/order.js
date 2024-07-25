const { createOrder, getAllOrders, cancelOrder, completeOrder, getSingleOrder } = require("../controllers/order");
const { isCustomer,isWorker} = require("../middlewares");

const router = require("express").Router();

router.post("/", isCustomer, createOrder);
router.get("/", getAllOrders);
router.get("/:id", getSingleOrder);
router.put("/cancel/:id", isCustomer, cancelOrder);
router.put("/complete/:id", isWorker, completeOrder);

module.exports = router