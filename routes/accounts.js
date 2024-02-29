const express = require("express");
const Account = require("../dal/accounts")
const mongoose = require("mongoose")
const User = require("../dal/user");
const { authenticateToken } = require("../middleware");
const router = express.Router();
const {getBalance} = require("../controllers/accountController")


router.get( "/", (req, res) => {
    res.status(200).send( "Welcome to the Accounts API")
})

router.post("/balance",getBalance)

router.post("/transfer",async (req,res)=>{
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const receiverId = req.body.to;
        const amount = req.body.amount;
        if(receiverId && amount){
            let receiverUser = await Account.findOne({userId:receiverId}).session(session).catch((e)=>{
                console.log('Error while finding receiver id: '+e);
                throw e; 
            });
            console.log(receiverUser);
            if(!receiverUser){
                await session.abortTransaction();
                res.status(400).json({"message":"Invalid Account"})

            }else{
                let fromAccount = await Account.findOne({userId:req.body.from}).session(session).catch((e)=>{
                    console.log('Error while finding receiver id: '+e);
                    throw e; 
                });
                if((fromAccount.balance/100) < amount){
                    await session.abortTransaction();
                    res.status(400).json({"status":false,"message":"Insufficient Balance"})
                }else{
                    await Account.updateOne({userId:req.body.from},{"$inc":{balance:-(amount*100)}});
                    await Account.updateOne({userId:req.body.to},{"$inc":{balance:(amount*100)}});

                    await session.commitTransaction();
                    res.status(200).json({"status":true , "message":"Transaction Successful!"});
                }
            }
        

        }else{
            res.status(500).json({"message":"Insufficient paramter"})
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }

})

module.exports = router
