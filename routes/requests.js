const {createRequest, cancelRequest} = require("../controllers/requests");
const { isCustomer} = require("../middlewares");

const router = require("express").Router();

router.post("/", isCustomer, createRequest);
router.put("/:id", isCustomer, cancelRequest);

module.exports = router