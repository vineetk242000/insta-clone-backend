const Post = require ("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment")

exports.createPost = async(req,res)=>{
    const{caption,user}=req.body;
    const imageUrl= req.file.path;
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
};


exports.deletePost = async(req,res)=>{
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
};


exports.explore = async(req,res)=>{
    Post.find().populate({
      path: "user",
      select: "userName email",
    }).lean().then(posts=>{
     res.json({success:true,statusCode:200,posts:posts})
    }).catch(err=>{
      res.json({success:false,statusCode:500,msg:"Unfortunately, can't get the posts right now"});
    })
};


exports.savePost = async(req,res)=>{
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
};

exports.unsavePost = async(req,res)=>{
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
};  


exports.likePost = async(req,res)=>{
  User.findByIdAndUpdate(req.params.userId,{
    $push:{likedPosts:req.params.postId}
  },(async err=>{
      if(err){
        res.json({success:false,statusCode:400,msg:"Try again later"})
      }else{
        await Post.findByIdAndUpdate(req.params.postId,{
          $inc:{likesCount : 1}
        })
        res.json({success:true,statusCode:200,msg:"Post Liked!"})
      }
    })
  )

}

exports.unLikePost = async(req,res)=>{
  await User.findByIdAndUpdate(req.params.userId,{
    $pull:{likedPosts:req.params.postId}
  },(async err=>{
      if(err){
        res.json({success:false,statusCode:400,msg:"Try again later"})
      }else{
       await Post.findByIdAndUpdate(req.params.postId,{
          $inc:{likesCount : -1}
        }
        )
        res.json({success:true,statusCode:200,msg:"Post unLiked!"})
      }
    })
  )

}

exports.getPosts = async(req,res)=>{
    Post.find({user:req.params.userId}).then(posts =>{
      res.json({success:true,statusCode:200,userId:req.params.userId,posts:posts})
    }).catch(err=>{
      res.json({success:false,statusCode:400,msg:err});
    })
};  

exports.getSavedPosts = async (req,res)=>{
    let savedPosts=[];
    let posts=[];
    let likedPosts=[];
    await User.findById(req.params.userId).then(user=> {
      user.savedPosts.map(postId=>(savedPosts.push(postId.toString())));
      user.likedPosts.map(postId=>(likedPosts.push(postId.toString())));
      })
      await savedPosts.forEach(postId=>{
        Post.findById(postId).lean().populate({
          path: "user",
          select: "userName email",
        }).then(post=>{
          if(likedPosts.includes(post._id.toString())){
            post.isLiked=true;
          }else{
            post.isLiked=false;
          }
          post.isSaved = true;
          posts.push(post);
          
          if(savedPosts.length ===  Object.keys(posts).length){
            res.json({succes:true,statusCode:200,posts:posts});
          }

        }).catch(err=>{
          res.json({success:false,statusCode:500,msg:err})
        })
      })

};

exports.addComments = (req,res)=>{
    const {comment,userId,postId} =req.body;
    const newComment = new Comment({
      text:comment,
      user:userId,
      post:postId
    })

    try{
      newComment.save();
      res.json({
        success:true,statusCode:200,msg:"Comment added"
      })
    }
    catch(err){
      res.json({
        success:false,statusCode:500,msg:"Something went wrong"
      });
     }

};

exports.getFeed = (async (req, res, next) => {
   let posts=[];
  let following=[];
  let likedPosts=[];
  let savedPosts=[];
  

    await User.findById(req.params.user).then(user=>{
    user.following.map(userId=>(following.push(userId)));
    user.likedPosts.map(postId=>(likedPosts.push(postId.toString())));
    user.savedPosts.map(postId=>(savedPosts.push(postId.toString())));

  })
  
  await following.forEach( userId => {
        Post.findOne({user:userId}).lean().populate({
          path: "user",
          select: "userName email",
        }).then( post=>{
        if(likedPosts.includes(post._id.toString())){
          post.isLiked=true;
        }else{
          post.isLiked=false;
        }
        if(savedPosts.includes(post._id.toString())){
          post.isSaved=true;
        }else{
          post.isSaved=false;
        }
        posts.push(post);
        if(following.length === Object.keys(posts).length){
          res.json({posts:posts})
        }
    }).catch(err=>{
      console.log(err);
    });
  })

});
