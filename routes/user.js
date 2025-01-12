const {signupUser, loginCustomer, loginWorker, loginAdmin, getAllUsers, signupWorker, getlinks} = require('../controllers/user');
const router = require('express').Router();

router.post('/signup', signupUser);
router.post('/signup/worker', signupWorker);
router.post('/login/customer', loginCustomer);
router.post('/login/worker', loginWorker);
router.post('/login/admin', loginAdmin);
router.get('/', getAllUsers);
router.get('/links', getlinks);

module.exports = router;
