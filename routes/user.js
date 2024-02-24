const express = require("express")
const {signUpBodySchema} = require("./auth-middleware")
const User = require("../dal/user");
const Account = require("../dal/accounts");
const router = express.Router()
const redis = require("redis")
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config")
const {authenticateToken} = require("../middleware")
router.use(express.json());

router.get("/bulk",async (req,res,next)=>{
    try {
        let username;
        let filter = req.query.filter || ""
        let whereObj = {
            "$or":[{
                "firstName":{"$regex":filter},
            },{
                "lastName":{"$regex":filter}
            }]
        }
        console.log(whereObj);
        User.find(whereObj).then((users)=>{
            console.log(users);
            let finalRes = users.map((user)=>{
                return {
                    userId: user._id,
                    userName:user.userName,
                    email:user.email,
                    firstName:user.firstName,
                    lastName:user.lastName
                }
            })
            res.status(200).send(finalRes)
        }).catch((e)=>{
            console.log(e);
            throw e;
        })
    } catch (error) {
      console.log("Error from get users: "+ error);
      res.status(500).send(error)  
    }
})

router.post("/userDetails",authenticateToken ,async(req,res,next)=>{
    try {
        if(!req.body.username){
            res.status(400).json({"message":"Please enter correct details"})
        }else{
            await User.findOne({userName:req.body.username}).catch((error)=>{
                console.log(error);
                throw error;
            }).then((user)=>{
                if(Object.keys(res)?.length){
                    res.status(200).json(user)
                }else{
                    res.status(400).json({"message":"No user found"})
                }
            })
        }
    } catch (error) {
        console.log("Error from get users: "+ error);
        res.status(500).send(error)  
    }
})

router.post("/signup" ,async (req,res,next)=>{
  const validationRes =   signUpBodySchema.safeParse(req.body);
  console.log(req);
  console.log(validationRes);
  if(!validationRes.success){
    return res.status(200).json(validationRes)
  }else{
    try {
        console.log(req);
        await User.findOne({userName:req.body.userName}).then(async (findUser)=>{
            console.log("Find User: "+findUser)
            if(findUser){
                return res.status(411).json({"message": "Username is already in use."});
            }else{
                let createdUser = await User.create({
                    userName:req.body.userName,
                    email:req.body.email,
                    firstName:req.body.firstName,
                    lastName: req.body.lastName,
                    password:req.body.password
                }).catch((e)=>{
                    console.log("error1::"+ e)
                    throw e;
                })
                const userID = createdUser._id;
                if(userID){
                    await Account.create({
                        userId:userID,
                        balance: ((Math.floor((Math.random()*10000))/100)+100)*100
                    }).catch((e)=>{
                        console.log("error2::"+ e)
                        throw e;
                    })
                }
                return res.status(200).json({"user": createdUser})
            }
        }).catch((e)=>{
            console.log("error2::"+e);
            throw e;
        })
        
    } catch (error) {
        console.log("outer error:"+ error);
        return res.status(500).json({
            "message":error.message
        })
    }
  }

})

router.post('/login', async (req,res,next)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;
        if(username && password){
            const user = await User.findOne({userName:username , password:password}).catch((e)=>{
                console.log("Error with finding user: " + e);
                throw e;
            });

            if(user && Object.keys(user).length){
                const userId = user._id;
                const token = jwt.sign({userId} , JWT_SECRET , {expiresIn:'1h'})
                return res.status(200).json({
                    "message":'Login Successful!',
                    'username':user.userName,
                    'token':token
                })
            }else{
                return res.status(400).json({
                    "message":'No user found with these details',
                }) 
            }
        }else{
            res.status(400).json({
                "message":"Incorrect params passed"
            })
        }
        
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);  
    }
   
})

router.post('/update',authenticateToken ,async (req,res)=>{
    try {
        const userName = req.body.username;
        const validateRes = signUpBodySchema.safeParse(req.body)
        if(!validateRes.success){
            res.status(411).json({"message":"Error while updating user","response":validateRes})
        }else{
            let updateObj = {
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                password:req.body.password
            }
            const updateRes = await User.updateOne({userName:req.body.username},updateObj);
            if(updateRes.modifiedCount){
                res.status(200).json({"message":"Successfully updated the user"});
            }else{
                res.status(500).json({"message":`No user with username : ${req.body.username} found in db`})
            }
            console.log(updateRes)
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

router.post("/logout",async (req,res)=>{
    if(req.body.token){
        jwt
        return res.status(411).json({"message":"user logout"})
    }else{
        res.status(411).json({"message":"Please pass token"})
    }
})
module.exports = router