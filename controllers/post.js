const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const moment = require("moment");

exports.createPost = async (req, res) => {
  const { caption } = req.body;
  const user = req.user._id;
  try {
    let images = [];
    for (let i = 0; i < req.files.images.length; i++) {
      images.push(req.files.images[i].location);
    }
    const newPost = new Post({
      images: images,
      caption: caption,
      user: user,
    });

    const post = await newPost.save();
    await User.findByIdAndUpdate(user, { $push: { posts: post._id } });
    res.status(200).json({ success: true, msg: "Post Created" });
  } catch (err) {
    console.log(err);
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.postId });
    await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: -1 } });
    res.json({
      success: true,
      statusCode: 200,
      msg: "Post deleted successfully",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.explore = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "user",
        select: "userName avatar _id",
      })
      .populate({
        path: "comments",
        select: "text",
        populate: {
          path: "user",
          select: "userName avatar _id",
        },
      })
      .lean();
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.log(err);
  }
};

exports.savePost = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedPosts: req.params.postId },
      $inc: { savedPostsCount: 1 },
    });
    res.json({ success: true, statusCode: 200, msg: "Post saved!" });
  } catch (err) {
    console.log(err);
  }
};

exports.unsavePost = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedPosts: req.params.postId },
      $inc: { savedPostsCount: -1 },
    });
    res.json({ success: true, statusCode: 200, msg: "Post saved!" });
  } catch (err) {
    console.log(err);
  }
};

exports.likePost = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { likedPosts: req.params.postId },
    });
    await Post.findByIdAndUpdate(req.params.postId, {
      $inc: { likesCount: 1 },
    });
    res.json({ success: true, statusCode: 200, msg: "Post Liked!" });
  } catch (err) {
    console.log(err);
  }
};

exports.unLikePost = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { likedPosts: req.params.postId },
    });
    await Post.findByIdAndUpdate(req.params.postId, {
      $inc: { likesCount: -1 },
    });
    res.json({ success: true, statusCode: 200, msg: "Post unLiked!" });
  } catch (err) {
    console.log(err);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = Post.find({ user: req.user._id })
      .populate({ path: "user", select: "userName avatar _id" })
      .populate({
        path: "comments",
        select: "text",
        populate: {
          path: "user",
          select: "userName _id avatar",
        },
      });
    res.json({
      success: true,
      statusCode: 200,
      userId: req.params.userId,
      posts: posts,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getSavedPosts = async (req, res, next) => {
  try {
    const document = await User.findById(req.user._id)
      .select("savedPosts -_id")
      .populate({
        path: "savedPosts",
        select: "images _id",
      });
    res.status(200).json({ success: true, savedPosts: document.savedPosts });
  } catch (err) {
    console.log(err);
  }
};

exports.addComments = async (req, res) => {
  const { comment, postId } = req.body;
  const userId = req.user._id;

  try {
    const newComment = new Comment({
      text: comment,
      user: userId,
      post: postId,
    });
    const savedComment = await newComment.save();
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
      $push: { comments: savedComment._id },
    });
    res.status(200).json({
      success: true,
      comment: savedComment,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    let posts = [];
    let following = [];
    let likedPosts = [];
    let savedPosts = [];
    await User.findById(req.user._id).then((user) => {
      user.following.map((userId) => following.push(userId));
      user.likedPosts.map((postId) => likedPosts.push(postId.toString()));
      user.savedPosts.map((postId) => savedPosts.push(postId.toString()));
    });

    await following.forEach((userId) => {
      const post = Post.findOne({ user: userId })
        .lean()
        .populate({
          path: "user",
          select: "userName avatar",
        })
        .populate({
          path: "comments",
          select: "text",
          populate: {
            path: "user",
            select: "userName _id avatar",
          },
        });
      if (likedPosts.includes(post._id.toString())) {
        post.isLiked = true;
      } else {
        post.isLiked = false;
      }
      if (savedPosts.includes(post._id.toString())) {
        post.isSaved = true;
      } else {
        post.isSaved = false;
      }
      post.createdAt = moment(Date.parse(post.createdAt)).fromNow();
      posts.push(post);
      if (following.length === Object.keys(posts).length) {
        res.json({ posts: posts });
      }
    });
  } catch (err) {
    console.log(err);
  }
};
