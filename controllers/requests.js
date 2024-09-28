const Request  = require("../models/Request");
const yup = require("yup");
const log = require("../utils/logger");
const {firestore} = require("../conn.js");


const createRequest = async (req, res) => {
    if (!req.body) {
        log("error", "Content can not be empty!");
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }
    const schema = yup.object().shape({
        time : yup.date().required(),
        description : yup.string().required(),
        work_type: yup.string().required().oneOf(["PLUMBER", "ELECTRICIAN", "CARPENTER", "MECHANIC", "PAINTER", "OTHER"]),
        category : yup.string(),
        address : yup.string().required(),
        location : yup.object().shape({lat : yup.number().required(), long : yup.number().required()})
    });
    try {
        log("info", "Validating request in createRequest");
        await schema.validate(req.body);
    } catch (error) {
        log("error", error.message);
        return res.status(400).json({
            message: error.message,
        });
    }
    const data = {
        ...req.body,"customer":req.user._id}
    const request = new Request(data);
    // const result = await request.save();
    data["customer_name"] = req.user.name;
    const d = new Date();
    data["order"] = `${d.getHours()}${d.getMinutes()}`;
    log("verbose","Data size:"+ Buffer.byteLength(JSON.stringify(data))+ "bytes");
    log("verbose","Data structure:"+ JSON.stringify(data));
    await Promise.all([firestore.collection("requests").doc(`${request._id}`).set(data), request.save()]);
    log("info", "Request created successfully in createRequest");
    return res.status(201).json({"message": "Request created successfully!","data":request});
};

const cancelRequest = async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
        log("error", "Request not found!");
        return res.status(404).json({
            message: "Request not found!",
        });
    }
    if (request.status !== "PENDING") {
        log("error", "Request cannot be cancelled!");
        return res.status(400).json({
            message: "Request cannot be cancelled!",
        });
    }
    const result = await Request.findByIdAndUpdate(req.params.id, {
        $set: { status: "CANCELLED" },
    });
    await firestore.collection("requests").doc(`${result._id}`).delete();
    log("info", "Request cancelled successfully!");
    return res.json({"message": "Request cancelled successfully!"});
};

module.exports = { createRequest, cancelRequest };
