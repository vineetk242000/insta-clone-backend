const express = require("express");
const { registerUser, login } = require("../controllers/auth");
const {
  createPost,
  deletePost,
  explore,
  savePost,
  unsavePost,
  likePost,
  unLikePost,
  getFeed,
  addComments,
  getPosts,
  getSavedPosts,
} = require("../controllers/post");
const {
  followUser,
  unfollowUser,
  editUserProfile,
  getFollowers,
  getFollowedUsers,
  getSuggestions,
  searchUser,
  getUser,
  getUserByUserName,
  getPost,
} = require("../controllers/user");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/me").get(protect, getUser);
router.route("/edit").post(protect, editUserProfile);
router.route("/search/:userName").get(protect, getUserByUserName);

router.route("/follow/:userId").get(protect, followUser);
router.route("/unfollow/:userId").get(protect, unfollowUser);
router.route("/followers").get(protect, getFollowers);
router.route("/followings").get(protect, getFollowedUsers);
router.route("/accounts").get(protect, getSuggestions);
router.route("/feed").get(protect, explore);
router.route("/posts").get(protect, getPosts);
router.route("/search").post(protect, searchUser);

module.exports = router;
