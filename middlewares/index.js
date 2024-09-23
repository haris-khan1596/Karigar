const {validateToken} = require('../services/authentication');


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

module.exports = {isAuthenticated, isAdmin, isCustomer, isWorker};
