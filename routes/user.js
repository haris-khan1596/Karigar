const {signupUser, loginCustomer, loginWorker, loginAdmin} = require('../controllers/user');
const router = require('express').Router();

router.post('/signup', signupUser);
router.post('/login/customer', loginCustomer);
router.post('/login/worker', loginWorker);
router.post('/login/admin', loginAdmin);

module.exports = router