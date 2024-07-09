const fs = require('fs');
const path = require('path');
const {getLogFilePath} = require('../utils');

const logFilePath = getLogFilePath();

function logRequest(req, res, next) {
    const requestLog = `${new Date().toISOString()} - ${req.method} - ${req.url} :\n ${req.ip} - ${JSON.stringify(req.headers)} - ${JSON.stringify(req.body)}\n`;

    fs.appendFile(logFilePath, requestLog, (err) => {
        if (err) {
            console.error('Error writing log file:', err);
        }
    });
    next();
}

module.exports = {logRequest};
