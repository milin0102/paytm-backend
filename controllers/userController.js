const express = require("express");
const User = require("../dal/user")
const jwt = require("jsonwebtoken");
const {signUpBodySchema , updateBodySchema} = require("../routes/request-validator")


async function getFilteredUsers(req,res){
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
        console.log(whereObj.$or[0].firstName);
        await User.find(whereObj).then((users)=>{
            let finalRes = []
            //console.log(users)
            if(users?.length){
                finalRes = users.map((user)=>{
                    return {
                        userId: user._id,
                        userName:user.userName,
                        email:user.email,
                        firstName:user.firstName,
                        lastName:user.lastName
                    }
                })
                return res.status(200).json({
                    httpStatusCode:200,
                    success: true,
                    data: finalRes
                })
            }else{
                return res.status(404).json({
                    httpStatusCode:404,
                    success: false,
                    data: finalRes
                })
            } 
        }).catch((error)=>{
            console.log("Error while finding users")
            throw error;
        })
    } catch (error) {
      console.log("Error from get users: "+ error);
      let finalError = {
        httpStatusCode:500,
        success:false,
        data:error
      }
      throw finalError
    }
}

async function getUserDetails(req,res,next){
    try {
        if(!req.body.username){
            res.status(400).json({"message":"Please enter correct details"})
        }else{
            await User.findOne({userName:req.body.username}).catch((error)=>{
                console.log(error);
                throw error;
            }).then((user)=>{
                if(user && Object.keys(user)?.length){
                    res.status(200).json({
                        httpStatusCode:200,
                        success:true,
                        data:user
                    })
                }else{
                    return res.status(404).json({
                        httpStatusCode:404,
                        success:200,
                        data:{"message":"No user found"}
                    })
                }

            })
        }
    } catch (error) {
        console.log("Error from get users: "+ error);
        res.status(500).send(error)  
    }
}

async function login(req,res){
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
                    httpStatusCode:200,
                    success:true,
                    data:{
                        'username':user.userName,
                        'token':token
                    },
                    message:'Login Successful!',
                   
                })
            }else{
                return res.status(400).json({
                    httpStatusCode:404,
                    success:true,
                    data:{},
                    message:'No user found with these details',
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
}

async function updateUserDetails(req,res){
    try {
        const userName = req.body.username;
        const validateRes = updateBodySchema.safeParse(req.body)
        if(!validateRes.success){
            res.status(411).json({
                httpStatusCode:411,
                success:false,
                data:validateRes,
                message:"Error while validating user details"})
        }else{
            let updateObj = {}
            if(req.body.firstName){
                updateObj.firstName = req.body.firstName
            }
            if(req.body.lastName){
                updateObj.lastName = req.body.lastName
            }
            if(req.body.password){
                updateObj.password = req.body.password
            }
            const updateRes = await User.updateOne({userName:req.body.username},updateObj);
            let response = {}
            if(updateRes.modifiedCount){
                response.httpStatusCode = 200;
                response.success=true;
                response.message="Successfully updated the user"
               
            }else{
                response.httpStatusCode = 500;
                response.success=false;
                response.message="No user with username : ${req.body.username} found in db"
            }
            console.log(updateRes)
            res.status(response.httpStatusCode).json(response);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

exports.getFilteredUsers = getFilteredUsers
exports.getUserDetails = getUserDetails
exports.login = login
exports.updateUserDetails = updateUserDetails