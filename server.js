const express = require("express");
const bcrypt=require("bcryptjs");
const passport=require("passport");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const app = express();
const jwt = require('jsonwebtoken')
const bodyParser = require("body-parser");
const cors=require("cors");
const Post = require('./models/post');
const User = require('./models/user');
const mongoDb=require('./utility/db');
const multer=require("multer");
const fs =require("fs");
const path=require('path');


const fileStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
  cb(null,path.join(__dirname, '/uploads/'));
  },
  filename:(req,file,cb)=>{
    cb(null,new Date().toISOString().replace(/:/g, '-')+file.originalname);
  }
});


const fileFilter =(req,file,cb)=>{
  if(file.mimetype==='image/png'||
  file.mimetype==='image/jpg'||
  file.mimetype==='image/jpeg'){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);


app.use(bodyParser.json());

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image')); 
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
  })
);





app.get("/",(req,res)=>{
    res.send("server is up");
})


// Register new User 

app.post("/register",(req,res)=>{
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
    
})


//  logging in User

app.post("/login",(req,res)=>{
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
            Post.find({user:user.id},function(err,posts){
            res.json({
              success: true,
              token: "Bearer " + token,
              posts:posts,
              followers:user.followers,
              followersCount:user.followersCount,
              following:user.following,
              followingCount:user.followingCount,
            });
          })
          }
        );
      }else{
        return res.json({success:false,code:405,message:"Password Incorrect"});
      }
    });
  })
 
});



// Create a new Post. Pass UserId, caption,file as body parameters

app.post("/createPost",(req,res)=>{
  const imageUrl= req.file.path;
  const{caption,user}=req.body;
  const newPost= new Post ({
    imageUrl:imageUrl,
    caption:caption,
    user:user,
  });
  try{
  newPost.save();
  User.findByIdAndUpdate(user,{$inc:{postCount:1}},(err=>{
      if(err){
       res.json({statusCode:500})
      }else{res.json({success:true,statusCode:200,msg:'Post Created'});}
  }))
  }
  catch(err){
   res.json({
     success:false,statusCode:500,msg:"Something went wrong"
   });
  }
});

// Route to delete a post, pass the post id and userId as a parameter to perform the task.

app.get("/delete/:postId/:userId",(req,res)=>{
  Post.deleteOne({_id:req.params.postId}).then(function() {
    User.findByIdAndUpdate(req.params.userId,{$inc:{postCount:-1}},(err)=>{
      if(err){
        res.json({statusCode:500})
      }else{
        res.json({success:true,statusCode:200,msg:'Post deleted successfully'})
      }
    })
  }).catch(err =>{
    res.json({success:false,statusCode:500,msg:err})
  })
})

// Route for following User. Here currentUserId= Logged In UserId and userId = UserId of the account to follow

app.get("/follow/:currentUserId/:userId",async(req,res)=>{
  const currentUserId=req.params.currentUserId;
  const userId=req.params.userId;

  if(currentUserId==userId){
    res.json({success:false,statusCode:401,msg:"You can not follow yourself"});
  }else{
      User.findByIdAndUpdate(userId,{
        $push:{followers:currentUserId},
        $inc:{followersCount:1}},function(err){
          if(err){
          res.json({success:false,statusCode:400,msg:err})
          }else{
            User.findByIdAndUpdate(currentUserId,{
              $push:{following:userId},
              $inc:{followingCount:1}},function(err) {
                if(err){
                  res.json({success:false,statusCode:500,msg:err})
                }else{
                  res.json({success:true,statusCode:200,msg:"successfully done"})
                }
                
              }
             )
          }
     
    })
  }
})



// Route to unfollow a user

app.get("/unfollow/:currentUserId/:userId",async(req,res)=>{
  const currentUserId=req.params.currentUserId;
  const userId=req.params.userId;

  if(currentUserId==userId){
    res.json({success:false,statusCode:401,msg:"You can not unfollow yourself"});
  }else{
      User.findByIdAndUpdate(userId,{
        $pull:{followers:currentUserId},
        $inc:{followersCount:-1}},function(err){
          if(err){
          res.json({success:false,statusCode:400,msg:err})
          }else{
            User.findByIdAndUpdate(currentUserId,{
              $pull:{following:userId},
              $inc:{followingCount:-1}},function(err) {
                if(err){
                  res.json({success:false,statusCode:500,msg:err})
                }else{
                  res.json({success:true,statusCode:200,msg:"successfully done"})
                }
                
              }
             )
          }
     
    })
  }
})


// Route to edit logged in User Profile. **Pass in previous values of fields as body parameters even if
// user doesnt want to update certain fields

app.post("/editUserProfile",(req,res)=>{
  const{name,email,userName,website,bio,gender,contact,userId}=req.body;
  User.findByIdAndUpdate(userId,{
    name,
    userName,
    email,
    website,
    bio,
    gender,
    contact
  },function(err){
    if(err){
      res.json({success:false,statusCode:400,msg:err})
    }else{
      res.json({success:true,statusCode:200,msg:"Successfully Updated"})
    }
  })
});



//Route to get posts for explore section

app.get('/explore',(req,res)=>{
  Post.find().then(posts=>{
   res.json({success:true,statusCode:200,posts:posts})
  }).catch(err=>{
    res.json({success:false,statusCode:500,msg:"Unfortunately, can't get the posts right now"});
  })
});


// Route to show logged in user suggestions of accounts to follow

app.get('/suggestions',(req,res)=>{
  User.find().then(users=>{
    res.json({statusCode:200,users:users})

  }).catch(err=>{
    res.json({statusCode:500,err})
  })
});


// Search users by passing userName as param

app.get('/search/:userName',(req,res)=>{
  User.findOne({userName:req.params.userName}).then(users=>{
    res.json({success:true,statusCode:200,users:users})
  }).catch(err=>{
    res.json({success:false,statusCode:500,err})
  })

})


app.get("/getposts/:userId",(req,res)=>{
  Post.find({user:req.params.userId}).then(posts =>{
    res.json({success:true,statusCode:200,userId:req.params.userId,posts:posts})
  }).catch(err=>{
    res.json({success:false,statusCode:400,msg:err});
  })
});

app.get("/togglelike/:postId",(req,res)=>{
                              
});

// Route to save a post to user Account

app.get("/savepost/:postId/:userId",(req,res)=>{
  User.findByIdAndUpdate(req.params.userId,{
    $push:{savedPosts:req.params.postId},
    $inc:{savedPostsCount: 1}
  },(err=>{
      if(err){
        res.json({success:false,statusCode:400,msg:"Try again later"})
      }else{
        res.json({success:true,statusCode:200,msg:"Post saved!"})
      }
    })
  )
});



// Route to unsave a post requested by User.

app.get("/unsavepost/:postId/:userId",(req,res)=>{
  User.findByIdAndUpdate(req.params.userId,{
    $pull:{savedPosts:req.params.postId},
    $inc:{savedPostsCount: -1}
  },(err=>{
      if(err){
        res.json({success:false,statusCode:400,msg:"Try again later"})
      }else{
        res.json({success:true,statusCode:200,msg:"Post unsaved!"})
      }
    })
  )
});



// Route to get all the saved posts of a user. Pass the user Id as parameter

app.get("/get_saved_posts/:userId",async (req,res)=>{
  var savedPosts=[];
 await User.findById(req.params.userId).then(data=> {
     for(var i=0;i<data.savedPosts.length;i++){
    Post.findById(data.savedPosts[i]).then(post =>{
     savedPosts.push(post);
    })
    }
  res.json({success:true,statusCode:200,userId:req.params.userId,savedPosts:savedPosts});
    }).catch(err=>{
      res.json({success:false,statusCode:500,msg:err})
    })
  })

             


app.listen(3001,()=>{
    console.log("hurray");
})
