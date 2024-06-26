const express = require("express");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const mongoose = require('mongoose');
const Post = require("../models/postsModel");
const User = require("../models/usersModel");
const Comment = require('../models/commentsModel')
const { isAuth, generateSendJWT } = require("../service/auth");

// 取得所有貼文
router.get("/", isAuth, handleErrorAsync(async (req, res, next) => {
  /*  #swagger.tags = ['Post']
      }]
  */
  const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";
  const q = req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
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

// 取得單一貼文
router.get("/:id", isAuth, handleErrorAsync(async (req, res, next) => {
  /*  #swagger.tags = ['Post']
      }]
  */
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return next(appError(400, "無效的貼文ID！"));
  }

  const post = await Post.findById(id)
    .populate({
      path: "user",
      select: "name photo email",
    })
    .populate({
      path: "comments",
      select: "comment user",
    })

  if (!post) {
    return next(appError(400, "無效的貼文ID！"));
  }

  res.status(200).json({
    status:"success",
    post
  })
}))

// 新增貼文
router.post("/", isAuth, handleErrorAsync(async (req, res, next) => {
    /*  #swagger.tags = ['Post']
        }]
    */
    let { content } = req.body;
    // 去除 content 前後空白，並檢查有無空白
    content = content.trim();
    if (!content) {
      return next(appError(400, "你沒有填寫 content 資料"));
    }

    const newPost = await Post.create({
      user: req.user.id,
      content,
    });
    res.status(200).json({
      status: "success",
      post: newPost,
    });
  })
);

// 新增一則貼文的讚
router.post("/:id/like", isAuth, handleErrorAsync(async (req, res, next) => {
    /*  #swagger.tags = ['Post']
        }]
    */
    const _id = req.params.id;
    // 檢查 req.params.id
    if (!_id || !mongoose.isValidObjectId(_id)) {
      return next(appError(400, "無效的貼文ID！"));
    }
    // 檢查貼文是否存在 
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      return next(appError(400, "輸入不存在的 post id"));
    }

    await Post.findOneAndUpdate({ _id }, { $addToSet: { likes: req.user.id } });

    res.status(201).json({
      status: "success",
      postId: _id,
      userId: req.user.id,
    });
  })
);

// 取消一則貼文的讚
router.delete("/:id/unlike", isAuth, handleErrorAsync(async (req, res, next) => {
    /*  #swagger.tags = ['Post']
        }]
    */
    const _id = req.params.id;
    // 檢查 req.params.id
    if (!_id || !mongoose.isValidObjectId(_id)) {
      return next(appError(400, "無效的貼文ID！"));
    }
    // 檢查貼文是否存在 
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      return next(appError(400, "輸入不存在的 post id"));
    }

    await Post.findOneAndUpdate({ _id }, { $pull: { likes: req.user.id } });

    res.status(201).json({
      status: "success",
      postId: _id,
      userId: req.user.id,
    });
  })
);

// 新增一則貼文的留言
router.post("/:id/comment", isAuth, handleErrorAsync(async (req, res, next) => {
  /*  #swagger.tags = ['Post']
      }]
  */
  const user = req.user.id;
  const post = req.params.id;

  let { comment } = req.body;
  // 去除 comment 前後空白，並檢查有無空白
  comment = comment.trim();
  if (!comment) {
    return next(appError(400, "你沒有填寫 comment 資料"));
  }

  const newComment = await Comment.create({
    user,
    post,
    comment
  })

  res.status(201).json({
    status: "success",
    comments: newComment
  })
}))

// 取得個人所有貼文列表
router.get("/user/:id", isAuth, handleErrorAsync(async (req, res, next) => {
    /*  #swagger.tags = ['Post']
        }]
    */
    const user = req.params.id;
    const posts = await Post.find({ user }).populate({
      path: "comments",
      select: "comment user",
    });

    res.status(200).json({
      status: "success",
      results: posts.length,
      posts,
    });
  })
);


module.exports = router;
