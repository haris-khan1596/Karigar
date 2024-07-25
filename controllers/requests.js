const Request  = require("../models/Request");
const yup = require("yup");
const {firestore} = require("../conn.js");


const createRequest = async (req, res) => {
    if (!req.body) {
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
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
    const data = {
        ...req.body,"customer":req.user._id}
    const request = new Request(data);
    const result = await request.save();
    data["customer_name"] = req.user.name;
    await firestore.collection("requests").doc(`${result._id}`).set(data);
    return res.status(201).json({"message": "Request created successfully!","data":result});
};

const cancelRequest = async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
        return res.status(404).json({
            message: "Request not found!",
        });
    }
    if (request.status !== "PENDING") {
        return res.status(400).json({
            message: "Request cannot be cancelled!",
        });
    }
    const result = await Request.findByIdAndUpdate(req.params.id, {
        $set: { status: "CANCELLED" },
    });
    await firestore.collection("requests").doc(`${result._id}`).delete();
    return res.json({"message": "Request cancelled successfully!"});
};

module.exports = { createRequest, cancelRequest };