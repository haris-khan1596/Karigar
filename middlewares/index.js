const {validateToken} = require('../services/authentication');
const log = require('../utils/logger');

function isAuthenticated(req, res, next) {
    if(!req.headers || !req.headers.authorization) {
        log('warn', 'Unauthenticated access');
        return res.status(403).json({message: 'Unauthenticated access'});
    }
    const token = req.headers.authorization.split(' ')[1];
    const payload = validateToken(token);
    if(payload) {
        req.user = payload;
        next();
    } else {
        log('warn', 'Unauthenticated access');
        res.status(403).json({message: 'Unauthenticated access'});
    }
}
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        log('warn', 'Unauthorized access');
        res.status(403).json({message: 'Unauthorized access'});
    }
}
function isCustomer(req, res, next) {
    if (req.user && req.user.role === 'CUSTOMER') {
        next();
    } else {
        log('warn', 'Unauthorized access');
        res.status(403).json({message: 'Unauthorized access'});
    }
}
function isWorker(req, res, next) {
    if (req.user && req.user.role === 'WORKER') {
        next();
    } else {
        log('warn', 'Unauthorized access');
        res.status(403).json({message: 'Unauthorized access'});
    }
}

module.exports = {isAuthenticated, isAdmin, isCustomer, isWorker};

