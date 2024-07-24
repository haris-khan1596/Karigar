const fs = require('fs');
const path = require('path');
const {getLogFilePath} = require('../utils');

const {validateToken} = require('../services/authentication');

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


function isAuthenticated(req, res, next) {
    if(!req.headers || !req.headers.authorization) {
        return res.status(403).json({message: 'Unauthenticated access'});
    }
    const token = req.headers.authorization.split(' ')[1];
    const payload = validateToken(token);
    if(payload) {
        req.user = payload;
        next();
    } else {
        res.status(403).json({message: 'Unauthenticated access'});
    }
}
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({message: 'Unauthorized access'});
    }
}
function isCustomer(req, res, next) {
    if (req.user && req.user.role === 'CUSTOMER') {
        next();
    } else {
        res.status(403).json({message: 'Unauthorized access'});
    }
}
function isWorker(req, res, next) {
    if (req.user && req.user.role === 'WORKER') {
        next();
    } else {
        res.status(403).json({message: 'Unauthorized access'});
    }
}

module.exports = {logRequest, isAuthenticated, isAdmin, isCustomer, isWorker};
