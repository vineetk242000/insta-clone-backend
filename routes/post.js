const express = require("express");
const {
  createPost,
  deletePost,
  likePost,
  unLikePost,
  explore,
  savePost,
  unsavePost,
  addComments,
  getSavedPosts,
  getPost,
} = require("../controllers/post");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.route("/new").post(protect, createPost);
router.route("/saved").get(protect, getSavedPosts);
router.route("/:id").get(protect, getPost).delete(protect, deletePost);
router.route("/explore").get(protect, explore);
router
  .route("/:postId/save")
  .put(protect, savePost)
  .delete(protect, unsavePost);

router
  .route("/:postId/like")
  .put(protect, likePost)
  .delete(protect, unLikePost);

router.route("/comment/new").post(protect, addComments);
router.route("/comment/:id").delete(protect);

module.exports = router;
