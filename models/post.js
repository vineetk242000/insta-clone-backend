const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postsSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postsSchema);

module.exports = Post;
