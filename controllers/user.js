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
  const avatar = req.file.path;

  try {
    await User.findByIdAndUpdate(userId, {
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
      avatar: avatar,
    });
  } catch (err) {
    console.log(err);
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
        req.params.userId.toString() != user._id.toString()
      ) {
        suggestedUsers.push(user);
      }
    });
    res.json({ success: true, statusCode: 200, users: suggestedUsers });
  } catch (err) {
    console.log(err);
  }
};

exports.getFollowers = async (req, res) => {
  let followers = [];
  let users = [];
  try {
    await User.findById(req.user._id).then((user) => {
      user.followers.map((follower) => followers.push(follower));
    });

    await followers.forEach((followerId) => {
      User.findById(followerId).then((user) => {
        users.push(user);

        if (followers.length === Object.keys(users).length) {
          res.json({ success: true, statusCode: 200, users: users });
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getFollowedUsers = async (req, res) => {
  let followedUsers = [];
  let users = [];
  try {
    await User.findById(req.user._id).then((user) => {
      user.following.map((userId) => followedUsers.push(userId));
    });

    await followedUsers.forEach((userId) => {
      User.findById(userId).then((user) => {
        users.push(user);

        if (followedUsers.length === Object.keys(users).length) {
          res.json({ success: true, statusCode: 200, users: users });
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};
