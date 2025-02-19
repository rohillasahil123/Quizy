const jwt = require("jsonwebtoken");
const secretKey = "credmantra";

function setUser(user){
    return jwt.sign(
    { _id: user.id, email: user.email, role: user.role, name: user.name },
    secretKey,
    { expiresIn: "24h"});
}

function getUser(token) {
    if(!token) return null;
    return jwt.verify(token , secretKey );
}

module.exports = {
    getUser,
    setUser
}