const mongoose = require("mongoose");


const commentsSchemma = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },

    user:{
        type: String,
        ref: 'User',
        required:true
    },

    post:{
        type: String,
        ref: 'Post',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

},{timestamps:true});

const Comment = mongoose.model('Comment',commentsSchemma);

module.exports = Comment ;