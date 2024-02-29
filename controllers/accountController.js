const Account = require("../dal/accounts")

async function getBalance(req,res){
    console.log("request body: " + req.body.userId)
    try {
        if(req.body.userId){
            let userId= req.body.userId;
            let whereObj = {
                userId: req.body.userId
            }
            await Account.findOne(whereObj).then((accountBalance)=>{
                let response = {}
                if(!accountBalance){
                    console.log("what a resp :" + accountBalance)
                    response.httpStatusCode = 400
                    response.success = false
                    response.message = "Account not found"
                    return res.status(400).json(response);
                }else{
                    response.httpStatusCode = 200
                    response.success = true
                    response.message = "Account found"
                    response.data = {balance :accountBalance.balance/100}
                    return res.status(200).json(response);
                }
            }).catch((e)=>{
                console.log("Error: "+e)
                throw e;
            })
        }else{
            let errorObj = {
                httpStatusCode:411,
                success:false,
                data:{message:"UserId is missing"}
            }
            res.status(411).json(errorObj)
        }
    } catch (error) {
        console.log("Error while fetching balance");
        throw error;
    }
}

async function transferBalance(req,res){
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const receiverId = req.body.to;
        const amount = req.body.amount;
        let responseObj = {}
        if(receiverId && amount){
            let receiverUser = await Account.findOne({userId:receiverId}).session(session).catch((e)=>{
                console.log('Error while finding receiver id: '+e);
                throw e; 
            });
            console.log(receiverUser);
            if(!receiverUser){
                await session.abortTransaction();
                responseObj.httpStatusCode=400
                responseObj.success = false
                responseObj.data = {
                    message:"Invalid Account"
                }
                res.status(400).json(responseObj)

            }else{
                let fromAccount = await Account.findOne({userId:req.body.from}).session(session).catch((e)=>{
                    console.log('Error while finding receiver id: '+e);
                    throw e; 
                });
                if((fromAccount.balance/100) < amount){
                    await session.abortTransaction();
                    responseObj.httpStatusCode=400
                    responseObj.success = false
                    responseObj.data = {
                    message:"Insufficient Balance"
                }
                    res.status(400).json(responseObj)
                }else{
                    await Account.updateOne({userId:req.body.from},{"$inc":{balance:-(amount*100)}});
                    await Account.updateOne({userId:req.body.to},{"$inc":{balance:(amount*100)}});

                    await session.commitTransaction();
                    responseObj.httpStatusCode=200
                    responseObj.success = true
                    responseObj.data = {
                    message:"Transaction Successful!"
                }
                    res.status(200).json(responseObj);
                }
            }
        }else{
            responseObj.httpStatusCode=500
                responseObj.success = false
                responseObj.data = {
                    message:"Insufficient paramter"
                }
            res.status(500).json(responseObj)
        }
        
    } catch (error) {
        console.log(error);
        let errorObj = {
            httpStatusCode:500,
            success:false,
            message:error
        }
        res.status(500).json(errorObj)
    }
}

exports.getBalance = getBalance