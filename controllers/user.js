const User = require("../models/User");
const yup = require("yup");
const { createTokenForUser } = require("../services/authentication");
const Order = require("../models/Order");
const log = require("../utils/logger");

const getAllUsers = async (req, res) => {
    log("info", "Getting all users");
    const users = await User.find();
    return res.json(users);
}
const signupUser = async (req, res) => {
    if (!req.body) {
        log("error", "Content can not be empty!");
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().required(),
        mobile_no: yup.string().required(),
        role: yup.string().oneOf(["CUSTOMER","WORKER", "ADMIN"]),
    });
    try {    
        log("info", "Validating request in signupUser");
        await schema.validate(req.body);
    } catch (error) {
        log("error", error.message);
        return res.status(400).json({
            message: error.message,
        });
    }

    const userExists = await User.find({ $or: [{ email: req.body.email }, { mobile_no: req.body.mobile_no }] });
    if (userExists.length > 0) {
        log("error", "User already exists!");
        return res.status(400).json({
            message: "User already exists!",
        });
    }

    const user = new User(req.body);
    const result = await user.save();

    // create token
    const token = createTokenForUser(user);
    log("info", "User created successfully!");
    return res.json({
        message: "User created successfully!",
        token
    });
}
const loginCustomer = async (req, res) => {
    if (!req.body) {
        log("error", "Content can not be empty!");
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        email: yup.string().required(),
        password: yup.string().required()
    });
    try {    
        log("info", "Validating request in loginCustomer");
        await schema.validate(req.body);
    } catch (error) {
        log("error", error.message);
        return res.status(400).json({
            message: error.message,
        });
    }
    const {email, password} = req.body;
    try {
        log("info", "Logging in customer");
        const {user,token} = await User.matchPasswordAndGenerateToken(email, password);
        if (user.role === "CUSTOMER") {
            log("info", "Customer logged in successfully!");
            return res.status(200).json({
              message: "User logged in successfully!",
              user,
              token,
            });
        }
        log("error", "Unauthorized access");
        return res.status(403).json({
          message: "Unauthorized access",
        });
      } catch (error) {
        log("error", error.message);
        return res.status(400).json({
          message: error.message,
        });
      }
}
const loginWorker = async (req, res) => {
    if (!req.body) {
        log("error", "Content can not be empty!");
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().required()
    });
    try {    
        log("info", "Validating request in loginWorker");
        await schema.validate(req.body);
    } catch (error) {
        log("error", error.message);
        return res.status(400).json({
            message: error.message,
        });
    }
    const {email, password} = req.body;
    try {
        log("info", "Logging in worker");
        const {user,token} = await User.matchPasswordAndGenerateToken(email, password);
        if (user.role === "WORKER") {
            log("info", "Worker logged in successfully!");
            const stats = await Order.getWorkerStats(user._id);
            user.stars = stats.stars;
            user.orders = stats.orders;
            return res.status(200).json({
              message: "User logged in successfully!",
              user,
              token,
            });
        }
        log("error", "Unauthorized access");
        return res.status(403).json({
          message: "Unauthorized access",
        });
      } catch (error) {
        log("error", error.message);
        return res.status(400).json({
          message: error.message,
        });
      }
}
const loginAdmin = async (req, res) => {
    if (!req.body) {
        log("error", "Content can not be empty!");
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().required()
    });
    try {    
        log("info", "Validating request in loginAdmin");
        await schema.validate(req.body);
    } catch (error) {
        log("error", error.message);
        return res.status(400).json({
            message: error.message,
        });
    }
    const {email, password} = req.body;
    try {
        log("info", "Logging in admin");
        const {user,token} = await User.matchPasswordAndGenerateToken(email, password);
        if (user.role === "ADMIN") {
            log("info", "Admin logged in successfully!");
            return res.status(200).json({
              message: "User logged in successfully!",
              user,
              token,
            });
        }
        log("error", "Unauthorized access");
        return res.status(403).json({
          message: "Unauthorized access",
        });
      } catch (error) {
        log("error", error.message);
        return res.status(400).json({
          message: error.message,
        });
      }
}
module.exports = {signupUser, loginCustomer, loginWorker, loginAdmin, getAllUsers};
