const {createRequest, cancelRequest} = require("../controllers/requests");

const router = require("express").Router();

router.post("/", createRequest);
router.put("/:id", cancelRequest);

module.exports = router