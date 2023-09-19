const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
otp:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},
createdAt:{
    type:Date,
    default:Date.now(),
    expires:15*60
}
})
module.exports = mongoose.model("Otp",otpSchema)