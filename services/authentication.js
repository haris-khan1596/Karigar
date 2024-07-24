const JWT = require("jsonwebtoken");
require('dotenv').config();
const secret = process.env.JWT_SECRET ;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    name: user.name,
    profile: user.profile||"https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg",
    email: user.email,
    role: user.role,
  };
  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
