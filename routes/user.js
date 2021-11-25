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
} = require("../controllers/user");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/me").get(protect, getUser);
router.route("/user/edit").post(protect, editUserProfile);

router
  .route("/follow/:userId")
  .put(protect, followUser)
  .delete(protect, unfollowUser);
router.route("/followers").get(protect, getFollowers);
router.route("/followings").get(protect, getFollowedUsers);
router.route("/users").get(protect, getSuggestions);
router.route("/feed").get(protect, getFeed);
router.route("/posts").get(protect, getPosts);
router.route("/posts/saved").get(protect, getSavedPosts);

router.route("/search").post(protect, searchUser);

module.exports = router;
