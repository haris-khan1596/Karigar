const mongoose = require('mongoose');
const admin = require("firebase-admin");
const serviceAccount = require("./Firebase.json");
const log = require('./utils/logger');

async function connectMongodb(url) {
  log('info', `MongoDB connected to ${url}`);
    return mongoose.connect(url);
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    log('info', "Firebase connected");
  } else {
    log('error', "Firebase service account is null");
  }
} catch (error) {
  log('error', error.message);
}

const firestore = admin.firestore();


module.exports = {connectMongodb, firestore};