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
} = require("../controllers/post");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.route("/new").post(protect, createPost);
router.route("/:id").delete(protect, deletePost);
router.route("/explore").get(protect, explore);
router.post("/save/:id").put(protect, savePost).delete(protect, unsavePost);

router.route("/like/:id").put(protect, likePost).delete(protect, unLikePost);

router.route("/comment/new").post(protect, addComments);
router.route("/comment/:id").delete(protect);

module.exports = router;
