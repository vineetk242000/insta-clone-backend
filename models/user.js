const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  savedPosts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
});

const User = mongoose.model("User", usersSchema);
module.exports = User;
