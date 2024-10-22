const mongoose = require("mongoose");

// Define the form schema
const formSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    role  : { type:String , required:true , enum:["student" , "other"]  } ,
    phoneNumber: { type: String, required: true },
    dob: { type: String, required: true },
    _id:false
});
// Define the student schema
const studentSchema = new mongoose.Schema({
    selectEducation: { type: String, required: true },
    fullname: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: Number , required: true },
    schoolName: { type: String, required: true },
    schoolAddress: { type: String, required: true },
    role: { type: String, required: true },
    boardOption: { type: String, required: true },
    classvalue: { type: String, required: true },
    mediumName: { type: String, required: true },
    aadharcard: { type: String, required: true },
   
});

// Combine the two schemas into a single schema
const combineSchema = new mongoose.Schema({
    studentDetails: { type: studentSchema , required : false },
    formDetails: { type: formSchema, required: false  },
    score: { type: Number, default: 0 },
});

// Export the combined model
module.exports = mongoose.model("CombineData", combineSchema);
