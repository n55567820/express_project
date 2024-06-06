var express = require("express");
var router = express.Router();
const Post = require("../models/posts");

router.get("/", async (req, res) => {
  try {
    const post = await Post.find();
    res.json({
      post,
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: "讀取錯誤",
      error: error,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.json({
      status: "success",
      posts: newPost,
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: "輸入內容錯誤",
      error: error,
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Post.deleteMany({});
    res.json({
      status: "success",
      posts: [],
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: "刪除錯誤",
      error: error,
    });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      posts: post,
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: "刪除錯誤",
      error: error,
    });
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const updatedPost = await Post.findByIdAndUpdate(id, body, { new: true });
    res.json({
      status: "success",
      posts: updatedPost,
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: "輸入內容錯誤",
      error: error,
    });
  }
});

module.exports = router;
