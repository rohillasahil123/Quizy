const mongoose = require("mongoose")

const phoneNumberschema = new mongoose.Schema ({
    phoneNumber: {type: String, required: true, unique: true},
    otp: {type: String, required: true},
    otpExpiration: {type: Date, required: true}
})

module.exports= mongoose.model("phoneNumber" , phoneNumberschema);