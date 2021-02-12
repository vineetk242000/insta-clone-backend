const User = require("../models/user");
const Post = require("../models/post")

exports.followUser = async(req,res)=>{
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
};

exports.unfollowUser = async(req,res)=>{
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
};

exports.editUserProfile = async(req,res)=>{
    const{name,email,userName,website,bio,gender,userId}=req.body;
    const avatar=req.file.path;
    User.findByIdAndUpdate(userId,{
      name,
      userName,
      email,
      website,
      bio,
      gender,
      avatar
    },function(err){
      if(err){
        res.json({success:false,statusCode:400,msg:err})
      }else{
        res.json({success:true,statusCode:200,msg:"Successfully Updated",avatar:avatar})
      }
    })
};


exports.searchUser = async(req,res)=>{
    User.findOne({userName:req.params.userName}).then(users=>{
      res.json({success:true,statusCode:200,users:users})
    }).catch(err=>{
      res.json({success:false,statusCode:500,err})
    })
};


exports.getUser = async(req,res)=>{
    await User.findById(req.params.userId).lean().then(async userData=>{
      await User.findById(req.params.reqUser).then(user=>{
        if(user.following.includes(userData._id)){
          userData.isFollowed=true
        }else{
          userData.isFollowed=false
        }
      })
      Post.find({user:userData._id}).populate({
        path:"user",
        select:"userName avatar _id"
      }).populate({
        path:"comments",
        select:"text",
        populate:{
          path:"user",
          select:"userName _id avatar"
        },
      }).then(posts=>{
         userData.posts = posts;
        res.json({success:true,statusCode:200,userData:userData})
       }).catch(err=>{
           res.json({success:false,statusCode:500,err})
        })

      });
   
};   


exports.getSuggestions = async(req,res)=>{
    let userFollowing=[];
    let suggestedUsers=[];
  
    await User.findById(req.params.userId).then(user=>{
      user.following.map(following=>(userFollowing.push(following)
      ));
    }); 
  
    await User.find().then(async users=>{
      await users.forEach(async user=>{
       if(!(userFollowing.toString().includes(user._id.toString())) && req.params.userId.toString()!=user._id.toString()){
         suggestedUsers.push(user);
       }
      })
      res.json({success:true,statusCode:200,users:suggestedUsers});
    }).catch(err=>{
      res.json({statusCode:500,err})
    })
};
  

exports.getFollowers =async (req,res)=>{
  let followers =[];
  let users =[]
  await User.findById(req.params.userId).then(user=>{
    user.followers.map(follower=>followers.push(follower));
  });

  

  await followers.forEach(followerId=>{
    User.findById(followerId).then(user=>{
      users.push(user);

      if(followers.length ===  Object.keys(users).length){
        res.json({success:true,statusCode:200,users:users})
      }

    }).catch(err=>{
      console.log(err);
    })
  })
}
  
exports.getFollowedUsers =async (req,res)=>{
  let followedUsers =[];
  let users =[]
  await User.findById(req.params.userId).then(user=>{
    user.following.map(userId=>followedUsers.push(userId));
  });

  

  await followedUsers.forEach(userId=>{
    User.findById(userId).then(user=>{
      users.push(user);

      if(followedUsers.length ===  Object.keys(users).length){
        res.json({success:true,statusCode:200,users:users})
      }
      
    }).catch(err=>{
      console.log(err);
    })
  })
}
  