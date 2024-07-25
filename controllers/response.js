const Response  = require("../models/Response");
const Request  = require("../models/Request");
const yup = require("yup");
const {firestore} = require("../conn.js");

async function createResponse(req, res) {
    if (!req.body) {
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }
    const schema = yup.object().shape({
        request: yup.string().required(),
    });
    try {
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
    const ratings = req.body.ratings || 0;
    const orders = req.body.orders || 0;
    const firestoredata = {"ratings": ratings,"name": req.user.name,"profile": req.user.profile, "orders":orders};
    const data = {...firestoredata,"worker": req.user._id, "request": req.body.request};
    await firestore.collection("requests").doc(req.body.request).collection("responses").add(firestoredata);
    const response = new Response(data);
    const result = await response.save();
    return res.status(201).json({"message": "Response created successfully!"});

}


module.exports = {createResponse}