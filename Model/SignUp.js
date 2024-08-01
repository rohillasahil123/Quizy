const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {type: String,required: true,},
    password: {type: String,required: true,},
    phoneNumber: {type: String,required: true,unique: true}
})

const Userdetail= mongoose.model("users", UserSchema);


module.exports = Userdetail
