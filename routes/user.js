const express = require("express")
const {signUpBodySchema} = require("./request-validator")
const User = require("../dal/user");
const Account = require("../dal/accounts");
const router = express.Router()
const redis = require("redis")
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config")
const {authenticateToken} = require("../middleware")
router.use(express.json());
const userController = require("../controllers/userController")

router.get("/bulk",userController.getFilteredUsers)

router.post("/userDetails",authenticateToken ,userController.getUserDetails)

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

router.post('/login',userController.login)

router.post('/update',authenticateToken ,userController.updateUserDetails)

module.exports = router