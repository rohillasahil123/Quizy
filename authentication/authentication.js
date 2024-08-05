const jwt = require("jsonwebtoken");
const secretKey = "credmantra"
const option = {
    expiresIn: "1h"
}
const authenticate = (req, res, next) => {
    const authtoken = req.header("authorization")
    if (!authtoken) {
        return res.status(400).send({ message:"token not provide" })
    }
    const token = authtoken.split(" ")[1]
    if (!token) {
        return res.status(400).send({ message:"token not found" })
    }
   jwt.verify(token, secretKey, option , (err, user)=> {
    if (err) {
        return res.status(400).send({ message: "token authhentication failed" })
    }
    req.user = user
    next()
})}
module.exports = authenticate 



