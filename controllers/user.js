const Post = require("../models/post");
const User = require("../models/user");

exports.followUser = async (req, res) => {
  const userId = req.params.userId;
  const user = req.user._id;

  if (user === userId) {
    res.status(400).json({
      success: false,
      statusCode: 401,
      msg: "You can not follow yourself",
    });
  } else {
    try {
      await User.findByIdAndUpdate(userId, {
        $push: { followers: user },
        $inc: { followersCount: 1 },
      });
      await User.findByIdAndUpdate(user, {
        $push: { following: userId },
        $inc: { followingCount: 1 },
      });
      res.json({
        success: true,
        statusCode: 200,
        msg: "successfully done",
      });
    } catch (err) {
      console.log(err);
    }
  }
};

exports.unfollowUser = async (req, res) => {
  const userId = req.params.userId;
  const user = req.user._id;

  if (user === userId) {
    res.json({
      success: false,
      statusCode: 401,
      msg: "You can not unfollow yourself",
    });
  } else {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: user },
        $inc: { followersCount: -1 },
      });
      await User.findByIdAndUpdate(user, {
        $pull: { following: userId },
        $inc: { followingCount: -1 },
      });
      res.json({
        success: true,
        statusCode: 200,
        msg: "successfully done",
      });
    } catch (err) {
      console.log(err);
    }
  }
};

exports.editUserProfile = async (req, res) => {
  const { name, email, userName, website, bio, gender } = req.body;
  const userId = req.user._id;

  if (req.files.avatar !== undefined) {
    const avatar = req.files.avatar[0].location;
    try {
      const document = await User.findByIdAndUpdate(userId, {
        name,
        userName,
        email,
        website,
        bio,
        gender,
        avatar,
      });
      res.status(200).json({
        success: true,
        userData: document,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      const document = await User.findByIdAndUpdate(userId, {
        name,
        userName,
        email,
        website,
        bio,
        gender,
      });
      res.status(200).json({
        success: true,
        userData: document,
      });
    } catch (err) {
      console.log(err);
    }
  }
};

exports.searchUser = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.params.userName });
    res.json({ success: true, statusCode: 200, user: user });
  } catch (err) {
    console.log(err);
  }
};

exports.getUser = async (req, res) => {
  try {
    const userData = await User.findById(req.user._id)
      .lean()
      .select("-password")
      .populate({
        path: "posts",
        select: "images caption date likes",
      });
    res.status(200).json({ success: true, userData });
  } catch (err) {
    console.log(err);
  }
};

exports.getSuggestions = async (req, res) => {
  let userFollowing = [];
  let suggestedUsers = [];

  try {
    await User.findById(req.user._id).then((user) => {
      user.following.map((following) => userFollowing.push(following));
    });

    const users = await User.find();
    users.forEach(async (user) => {
      if (
        !userFollowing.toString().includes(user._id.toString()) &&
        req.user._id.toString() != user._id.toString()
      ) {
        suggestedUsers.push(user);
      }
    });
    res.status(200).json({ success: true, users: suggestedUsers });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const users = await User.findById(req.user._id)
      .select("followers -_id")
      .populate({
        path: "followers",
        select: "avatar _id userName",
      });
    res.status(200).json({ success: true, users: users.followers });
  } catch (err) {
    console.log(err);
  }
};

exports.getFollowedUsers = async (req, res) => {
  try {
    const users = await User.findById(req.user._id)
      .select("following -_id")
      .populate({
        path: "following",
        select: "avatar _id userName",
      });
    res.status(200).json({ success: true, users: users.following });
  } catch (err) {
    console.log(err);
  }
};

exports.getUserByUserName = async (req, res) => {
  const { userName } = req.params;
  try {
    const userData = await User.findOne({ userName: userName })
      .populate({ path: "posts", select: "images _id" })
      .select("-password");
    res.status(200).json({ success: true, userData });
  } catch (err) {
    console.log(err);
  }
};
