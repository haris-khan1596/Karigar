const mongoose = require('mongoose');

async function connectMongodb(url) {
    return mongoose.connect(url);
}

module.exports = {connectMongodb};