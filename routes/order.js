const { createOrder, getAllOrders, cancelOrder, completeOrder, getSingleOrder, sentPayment, paidPayment, unpaidPayment, startedOrder, feedbackOrder, updateOrder } = require("../controllers/order");
const { isCustomer,isWorker} = require("../middlewares");

const router = require("express").Router();

router.post("/", isCustomer, createOrder);
router.get("/", getAllOrders);
router.get("/:id", getSingleOrder);
// router.put("/:id", updateOrder);
router.put("/feedback/:id", isCustomer, feedbackOrder);
router.put("/cancel/:id", cancelOrder);
router.put("/start/:id", isWorker, startedOrder);
router.put("/complete/:id", isWorker, completeOrder);
router.put("/payment/sent/:id", isCustomer, sentPayment);
router.put("/payment/paid/:id", isWorker, paidPayment);
router.put("/payment/reject/:id", isWorker, unpaidPayment);

module.exports = router