const {createResponse, cancelResponse} = require("../controllers/response");
const router = require("express").Router();

const { isWorker, isCustomer} = require("../middlewares");

router.post("/", isWorker, createResponse);
router.delete("/:id", isCustomer, cancelResponse);
module.exports = router