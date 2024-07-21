const mongoose = require('mongoose');
const admin = require("firebase-admin");
const serviceAccount = require("./Firebase.json");

async function connectMongodb(url) {
    return mongoose.connect(url);
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const firestore = admin.firestore();


module.exports = {connectMongodb, firestore};