const { createOrder, getAllOrders, cancelOrder, completeOrder, getSingleOrder, sentPayment, paidPayment, unpaidPayment } = require("../controllers/order");
const { isCustomer,isWorker} = require("../middlewares");

const router = require("express").Router();

router.post("/", isCustomer, createOrder);
router.get("/", getAllOrders);
router.get("/:id", getSingleOrder);
router.put("/cancel/:id", isCustomer, cancelOrder);
router.put("/complete/:id", isWorker, completeOrder);
router.put("/payment/sent/:id", isCustomer, sentPayment);
router.put("/payment/paid/:id", isCustomer, paidPayment);
router.put("/payment/reject/:id", isCustomer, unpaidPayment);

module.exports = router