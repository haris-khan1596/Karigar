const User = require("../models/User");
const yup = require("yup");
const { createTokenForUser } = require("../services/authentication");
const Order = require("../models/Order");

const getAllUsers = async (req, res) => {
    const users = await User.find();
    return res.json(users);
}
const signupUser = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().required(),
        role: yup.string().oneOf(["CUSTOMER","WORKER", "ADMIN"]),
    });
    try {    
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }

    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
        return res.status(400).json({
            message: "User already exists!",
        });
    }

    const user = new User(req.body);
    const result = await user.save();

    // create token
    const token = createTokenForUser(user);
    return res.json({
        message: "User created successfully!",
        token
    });
}
const loginCustomer = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        email: yup.string().required(),
        password: yup.string().required()
    });
    try {    
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
    const {email, password} = req.body;
    try {
        const {user,token} = await User.matchPasswordAndGenerateToken(email, password);
        if (user.role === "CUSTOMER") {
            return res.status(200).json({
              message: "User logged in successfully!",
              user,
              token,
            });
        }
        return res.status(403).json({
          message: "Unauthorized access",
        });
      } catch (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
}
const loginWorker = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().required()
    });
    try {    
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
    const {email, password} = req.body;
    try {
        const {user,token} = await User.matchPasswordAndGenerateToken(email, password);
        if (user.role === "WORKER") {
            const stats = await Order.getWorkerStats(user._id);
            user.stars = stats.stars;
            user.orders = stats.orders;
            return res.status(200).json({
              message: "User logged in successfully!",
              user,
              token,
            });
        }
        return res.status(403).json({
          message: "Unauthorized access",
        });
      } catch (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
}
const loginAdmin = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Content can not be empty!",
        });
    }

    const schema = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().required()
    });
    try {    
        await schema.validate(req.body);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
    const {email, password} = req.body;
    try {
        const {user,token} = await User.matchPasswordAndGenerateToken(email, password);
        if (user.role === "ADMIN") {
            return res.status(200).json({
              message: "User logged in successfully!",
              user,
              token,
            });
        }
        return res.status(403).json({
          message: "Unauthorized access",
        });
      } catch (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
}
module.exports = {signupUser, loginCustomer, loginWorker, loginAdmin, getAllUsers};