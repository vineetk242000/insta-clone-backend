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
        type: String,
        ref: 'User',
        required:true
    },
},{timestamps:true});

const Post = mongoose.model('Post', postsSchema);

module.exports = Post;