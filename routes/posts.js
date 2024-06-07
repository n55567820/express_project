const express = require("express");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const Post = require("../models/postsModel");
const User = require("../models/usersModel");
const Comment = require('../models/commentsModel')
const { isAuth, generateSendJWT } = require("../service/auth");

// 取得所有貼文
router.get("/", handleErrorAsync(async (req, res, next) => {
    const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
    const posts = await Post.find(q)
      .populate({
        path: "user",
        select: "name photo email",
      })
      .populate({
        path: "comments",
        select: "comment user",
      })
      .sort(timeSort);
    // asc 遞增(由小到大，由舊到新) createdAt ;
    // desc 遞減(由大到小、由新到舊) "-createdAt"
    res.status(200).json({
      posts,
    });
  })
);

// 新增貼文
router.post("/", isAuth, handleErrorAsync(async (req, res, next) => {
    const { content } = req.body;
    if (!content) {
      return next(appError(400, "你沒有填寫 content 資料"));
    }
    const newPost = await Post.create({
      user: req.user.id,
      content,
    });
    res.status(200).json({
      message: "success",
      post: newPost,
    });
  })
);

module.exports = router;
