const mongoose = require('mongoose');
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");
const log = require("../utils/logger");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile_no: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt:{
        type: String
    },
    role: {
        type: String,
        enum: ["CUSTOMER","WORKER", "ADMIN"],
        default: "CUSTOMER",
      },
    worker_type: {
        type: Array,
        required: function() {
          return this.role === 'WORKER';
        }
      },
    }, 
    {
    timestamps: true
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.salt;
    return userObject;
}

UserSchema.pre("save", function (next) {
  log("info", "Encrypting password");
    const user = this;
  
    if (!user.isModified("password")) return;
  
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt)
      .update(user.password)
      .digest("hex");
  
    this.salt = salt;
    this.password = hashedPassword;
    log("info", "Password encrypted successfully");
  
    next();
  });

  UserSchema.static(
    "matchPasswordAndGenerateToken",
    async function (email, password) {
      log("info", "Logging in user");
      const user = await this.findOne({ email });
      if (!user){ 
        log("error", "User not found");
        throw new Error("User not found!");
      }
  
      const salt = user.salt;
      const hashedPassword = user.password;
  
      const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");
  
      if (hashedPassword !== userProvidedHash){
        log("error", "Incorrect Password");
        throw new Error("Incorrect Password");
      }
      
      const token = createTokenForUser(user);
      const userData = user.toJSON();
      return {"user":userData,token};
    }
  );

module.exports = mongoose.model('User', UserSchema);
