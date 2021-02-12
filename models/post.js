const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const postsSchema = new mongoose.Schema({
    caption:{
      type:String,
      required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    date: {
          type: Date,
          default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    likesCount: {
        type:Number,
        default:0

    },
    comments: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
    commentsCount: {
        type: Number,
        default: 0,
    },
},{timestamps:true});

const Post = mongoose.model('Post', postsSchema);

module.exports = Post;