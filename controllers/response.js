const Response = require("../models/Response");
const yup = require("yup");
const { firestore } = require("../conn.js");

async function createResponse(req, res) {
    if (!req.body) {
        log("error", "Content can not be empty!");
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }
    const schema = yup.object().shape({
        request: yup.string().required(),
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
    const ratings = req.body.ratings || 0;
    const orders = req.body.orders || 0;
    const firestoredata = { "ratings": ratings, "worker": req.user._id, "name": req.user.name, "profile": req.user.profile, "orders": orders };
    const data = { ...firestoredata, "worker": req.user._id, "request": req.body.request };
    const response = new Response(data);
    const [result, response_num] = await Promise.all([response.save(), Response.countDocuments({})]);
    firestoredata._id = result._id.toString();
    firestoredata.order = response_num;
    await firestore.runTransaction(async (transaction) => {
        const request = await transaction.get(firestore.collection("requests").doc(req.body.request));
        const workerIds = (request.data() || {}).workerIds || [];
        transaction.update(firestore.collection("requests").doc(req.body.request), { "workerIds": [...workerIds, req.user._id] });
        transaction.set(firestore.collection("requests").doc(req.body.request).collection("responses").doc(), firestoredata);
    });
    log("info", "Response created successfully!");
    return res.status(201).json({ "message": "Response created successfully!" });

}


async function cancelResponse(req, res) {
    const response = await Response.findById(req.params.id);
    if (!response) {
        return res.status(404).json({
            message: "Response not found!",
        });
    }
    await firestore.runTransaction(async (transaction) => {
        const request = await transaction.get(firestore.collection("requests").doc(response.request));
        const workerIds = (request.data() || {}).workerIds || [];
        transaction.update(firestore.collection("requests").doc(response.request), { "workerIds": workerIds.filter((id) => id !== response.worker) });
        transaction.delete(firestore.collection("requests").doc(response.request).collection("responses").doc(response._id));
    })
    return res.status(200).json({
        message: "Response canceled successfully!",
    });
}


module.exports = { createResponse, cancelResponse }