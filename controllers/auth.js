const User = require("../models/user");
const Post = require ("../models/post")
const bcrypt=require("bcryptjs");
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");

exports.registerUser = async(req,res)=>{
  const {name,email,pass,userName}=req.body;
  
    if(!name,!email,!pass,!userName){
      res.json({success:false,statusCode:400,msg:"One or more fields is missing"});
    }else{
     User.findOne({email:email})
     .then(user =>{
       if(user){
          res.json({success:false,statusCode:401,msg:"Email is already Registered"})
        }else{
          User.findOne({userName:userName})
          .then(user =>{
            if(user){
              res.json({success:false,statusCode:402,msg:"User name already taken"})
            }else{
              const newUser = new User({
                name,
                email,
                pass,
                userName
              });
      
              //password encryption
              bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newUser.pass, salt, function(err, hash) {
                    if(err) throw err;
                    newUser.pass=hash;
                    try{
                    newUser.save()
                    .then(user =>{
                      res.json({success:true,statusCode:200,user:user})
                    })}
                    catch(err){res.json({success:false,statusCode:500,msg:"Account can not be created due to an error. Try again later"}) };
                });
            });
            }
          })
          
  
        }
      
      })
    }
      
}


exports.login = async(req,res)=>{
  const {userName,pass}=req.body;

  User.findOne({userName:userName})
  .then(user =>{
    if(!user){
      return res.json({success:false,code:404,message:"User id does not exist"});
    }


    bcrypt.compare(pass,user.pass,(err,isMatch) => {
      if (err) throw err;
      if(isMatch){
        const payload = {
          id: user.id,
          name: user.name,
          pass:user.pass,
          userName:user.userName,
          email:user.email
        };
        jwt.sign(
          payload,
          'secret',
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            Post.find({user:user.id}).populate({
              path: "user",
              select: "userName avatar",
            }).populate({
              path:"comments",
              select:"text",
              populate:{
                path:"user",
                select:"userName _id avatar"
              },
            }).then(posts=>{
              res.json({
                  success: true,
                  token: token,
                  userId:user._id,
                  userName:user.userName,
                  name:user.name,
                  bio:user.bio,
                  website:user.website,
                  gender:user.gender,
                  email:user.email,
                  avatar:user.avatar,
                  posts:posts,
                  followers:user.followers,
                  followersCount:user.followersCount,
                  following:user.following,
                  followingCount:user.followingCount,
                  postCount:user.postCount
                });
          })
          }
        );
      }else{
        return res.json({success:false,code:405,message:"Password Incorrect"});
      }
    });
  })
 
};
