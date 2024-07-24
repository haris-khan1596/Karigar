const {createResponse} = require("../controllers/response");
const router = require("express").Router();

const { isWorker} = require("../middlewares");

router.post("/", isWorker, createResponse);
module.exports = router