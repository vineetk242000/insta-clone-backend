const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const moment = require("moment");

exports.createPost = async (req, res) => {
  const { caption } = req.body;
  const user = req.user._id;
  let images = [];
  for (let i = 0; i < req.files.images.length; i++) {
    images.push(req.files.images[i].location);
  }
  const newPost = new Post({
    images: images,
    caption: caption,
    user: user,
  });

  try {
    newPost.save().then((doc) => {
      User.findByIdAndUpdate(user, { $push: { posts: doc._id } }, (err) => {
        if (err) {
          res.status(500).json({ success: false, msg: "Try again Later" });
        } else {
          res.status(200).json({ success: true, msg: "Post Created" });
        }
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

exports.deletePost = async (req, res) => {
  Post.deleteOne({ _id: req.params.postId })
    .exec()
    .then(async () => {
      User.findByIdAndUpdate(
        req.user._id,
        { $inc: { postCount: -1 } },
        (err) => {
          if (err) {
            res.json({ statusCode: 500 });
          } else {
            res.json({
              success: true,
              statusCode: 200,
              msg: "Post deleted successfully",
            });
          }
        }
      );
    })
    .catch((err) => {
      res.json({ success: false, statusCode: 500, msg: err });
    });
};

exports.explore = async (req, res) => {
  Post.find()
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
    .lean()
    .then((posts) => {
      res.json({ success: true, statusCode: 200, posts: posts });
    })
    .catch((err) => {
      res.json({
        success: false,
        statusCode: 500,
        msg: "Unfortunately, can't get the posts right now",
      });
    });
};

exports.savePost = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { savedPosts: req.params.postId },
      $inc: { savedPostsCount: 1 },
    },
    (err) => {
      if (err) {
        res.json({ success: false, statusCode: 400, msg: "Try again later" });
      } else {
        res.json({ success: true, statusCode: 200, msg: "Post saved!" });
      }
    }
  );
};

exports.unsavePost = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { savedPosts: req.params.postId },
      $inc: { savedPostsCount: -1 },
    },
    (err) => {
      if (err) {
        res.json({ success: false, statusCode: 400, msg: "Try again later" });
      } else {
        res.json({ success: true, statusCode: 200, msg: "Post unsaved!" });
      }
    }
  );
};

exports.likePost = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { likedPosts: req.params.postId },
    },
    async (err) => {
      if (err) {
        res.json({ success: false, statusCode: 400, msg: "Try again later" });
      } else {
        await Post.findByIdAndUpdate(req.params.postId, {
          $inc: { likesCount: 1 },
        });
        res.json({ success: true, statusCode: 200, msg: "Post Liked!" });
      }
    }
  );
};

exports.unLikePost = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { likedPosts: req.params.postId },
    },
    async (err) => {
      if (err) {
        res.json({ success: false, statusCode: 400, msg: "Try again later" });
      } else {
        await Post.findByIdAndUpdate(req.params.postId, {
          $inc: { likesCount: -1 },
        });
        res.json({ success: true, statusCode: 200, msg: "Post unLiked!" });
      }
    }
  );
};

exports.getPosts = async (req, res) => {
  Post.find({ user: req.user._id })
    .populate({ path: "user", select: "userName avatar _id" })
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "userName _id avatar",
      },
    })
    .then((posts) => {
      res.json({
        success: true,
        statusCode: 200,
        userId: req.params.userId,
        posts: posts,
      });
    })
    .catch((err) => {
      res.json({ success: false, statusCode: 400, msg: err });
    });
};

exports.getSavedPosts = async (req, res, next) => {
  let savedPosts = [];
  let posts = [];
  let likedPosts = [];

  await User.findById(req.params.userId).then((user) => {
    user.savedPosts.map((postId) => savedPosts.push(postId));
    user.likedPosts.map((postId) => likedPosts.push(postId.toString()));
  });

  await savedPosts.forEach(async (postId) => {
    Post.findById(postId)
      .lean()
      .populate({
        path: "user",
        select: "userName avatar _id",
      })
      .populate({
        path: "comments",
        select: "text",
        populate: {
          path: "user",
          select: "userName _id avatar",
        },
      })
      .then(async (post) => {
        if (likedPosts.includes(post._id.toString())) {
          post.isLiked = true;
        } else {
          post.isLiked = false;
        }
        post.isSaved = true;
        posts.push(post);
        console.log(posts);

        if (savedPosts.length === Object.keys(posts).length) {
          res.json({ succes: true, statusCode: 200, posts: posts });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.addComments = async (req, res) => {
  const { comment, postId } = req.body;
  const userId = req.user._id;
  const newComment = new Comment({
    text: comment,
    user: userId,
    post: postId,
  });

  try {
    const savedComment = await newComment.save();
    await savedComment
      .populate({
        path: "user",
        select: "avatar userName _id",
      })
      .execPopulate();
    Post.findByIdAndUpdate(
      postId,
      {
        $inc: { commentsCount: 1 },
        $push: { comments: savedComment._id },
      },
      (err) => {
        if (!err) {
          res.json({
            success: true,
            statusCode: 200,
            msg: "Comment added",
            comment: savedComment,
          });
        } else {
          res.json({
            success: false,
            statusCode: 500,
            msg: "Something went wrong",
          });
        }
      }
    );
  } catch (err) {
    res.json({
      success: false,
      statusCode: 500,
      msg: "Something went wrong",
    });
  }
};

exports.getFeed = async (req, res, next) => {
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
    Post.findOne({ user: userId })
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
      })
      .then(async (post) => {
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
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
