const mongoose  = require("mongoose") ; 

const shoppingPartnerSchema = new mongoose.Schema({
    createdBy: mongoose.Schema.Types.ObjectId,
    ownerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    localAddress: {
      type: String,
      required: true,
    },
    balance: {
      type: Number, 
      default: 0
    },
    category: {
      type: String,
      required: true,
    },
})
module.exports = mongoose.model("shoppingPartner", shoppingPartnerSchema);