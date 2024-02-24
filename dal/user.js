const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    userName: {type:String  , required:true , unique:true, lowerCase:true , minLength:3 , maxLength:400},
    email:{type:String  , required:true , unique:true, lowerCase:true , minLength:3 , maxLength:400},
    firstName:  { type: String, required: true , lowerCase:true , minLength:3 , maxLength:400},
    lastName: {type:String , required:true, lowerCase:true , minLength:3 , maxLength:400},
    password: {type:String , required:true, minLength:6}
})

const  User = mongoose.model("User",userSchema)

module.exports = User
