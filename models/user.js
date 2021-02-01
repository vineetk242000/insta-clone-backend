const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const usersSchema = new mongoose.Schema({
    name: {
      type: String,
      required:true
    },
    avatar:{
      type:String,
    },
    email: {
      type: String,
      required:true
    },
    pass: {
      type: String,
      required:true
    },
    userName:{
      type:String,
      required:true
    },
    website:{
      type:String,
    },
    bio:{
      type:String,
    },
    gender:{
      type:String,
    },
    date: {
      type: Date,
      default: Date.now
    },
    following:[{ type: mongoose.Schema.ObjectId, ref: "User" }],
    followingCount:{
        type:Number,
        default:0
    },
    followers:[{ type: mongoose.Schema.ObjectId, ref: "User" }],
    followersCount:{
        type:Number,
        default:0
    },
    postCount:{
      type:Number,
      default:0
    },
    savedPosts:[{type: mongoose.Schema.ObjectId,ref:"Posts"}],
    savedPostsCount:{
      type:Number,
      default:0,
    },
    likedPosts:[{type: mongoose.Schema.ObjectId,ref:"Posts"}]
  });
  
  const User = mongoose.model('User', usersSchema);
  module.exports = User;