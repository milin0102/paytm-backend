const mongoose = require("mongoose")

mongoose.connect('mongodb+srv://milin0102:milin0102@cluster0.fzgaw.mongodb.net/paytm').then(()=>{
    console.log("connection established")
}).catch((e)=>{
    console.log("Connection not Established "+e);
    throw e;
})