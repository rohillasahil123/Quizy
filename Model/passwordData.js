const mongoose = require('mongoose');
const passwordSchema = new mongoose.Schema({
    phoneNumberId :{
        type:String,
        required:true,
    },
    password:{
        type :Number , 
        required : true,
    }
});

module.exports = mongoose.model("password",passwordSchema);