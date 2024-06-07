const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/usersModel");
const Post = require("../models/postsModel");
const { isAuth, generateSendJWT } = require("../service/auth");

// 註冊會員
router.post("/sign_up", handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError(400, "欄位未填寫正確！"));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致！"));
    }
    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼字數低於 8 碼"));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError(400, "Email 格式不正確"));
    }

    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      email,
      password,
      name,
    });

    generateSendJWT(newUser, 201, res);
  })
);

// 登入會員
router.post("/sign_in", handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, "帳號密碼不可為空"));
    }
    const user = await User.findOne({ email }).select("+password");
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, "您的密碼不正確"));
    }

    generateSendJWT(user, 200, res);
  })
);

// 重設密碼
router.post("/updatePassword", isAuth, handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致！"));
    }
    const newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });

    generateSendJWT(user, 200, res);
  })
);

// 取得個人資料
router.get("/profile", isAuth, handleErrorAsync(async (req, res, next) => {
    res.status(200).json({
      status: "success",
      user: req.user,
    });
  })
);

// 更新個人資料
router.patch("/profile", isAuth, handleErrorAsync(async (req, res, next) => {
    const { name, sex, photo } = req.body;

    if (!name || !sex || !photo) {
      return next(appError(400, "欄位未填寫正確！"));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        sex,
        photo,
      },
      { new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: "success",
      user: user,
    });
  })
);

// 追蹤朋友
router.post("/:id/follow", isAuth, handleErrorAsync(async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return next(appError(401, "您無法追蹤自己"));
  }

  await User.updateOne(
    {
      _id: req.user.id,
      "following.user": { $ne: req.params.id }
    },
    {
      $addToSet: { following: { user: req.params.id } }
    }
  );

  await User.updateOne(
    {
      _id: req.params.id,
      "followers.user": { $ne: req.user.id }
    },
    {
      $addToSet: { followers: { user: req.user.id } }
    }
  );

  res.status(200).json({
    status: "success",
    message: "您已成功追蹤！"
  });
}))

// 取消追蹤朋友
router.delete("/:id/unfollow", isAuth, handleErrorAsync(async (req, res, next) =>{
  if (req.user.id === req.params.id) {
    return next(appError(401, "您無法取消追蹤自己"));
  }

  await User.updateOne(
    {
      _id: req.user.id
    },
    {
      $pull: { following: { user: req.params.id } }
    }
  );

  await User.updateOne(
    {
      _id: req.params.id
    },
    {
      $pull: { followers: { user: req.user.id } }
    }
  );

  res.status(200).json({
    status: "success",
    message: "您已成功取消追蹤！"
  });
}))

// 取得個人按讚列表
router.get("/getLikeList", isAuth, handleErrorAsync(async (req, res, next) => {

  const likeList = await Post.find({
    likes: { $in: [req.user.id] }
  }).populate({
    path: "user",
    select: "name _id"
  })

  res.status(200).json({
    status: 'success',
    likeList
  });
}))

// 取得個人追蹤名單
router.get("/following", isAuth, handleErrorAsync(async (req, res, next) => {
  // const followList = await User.findById(req.user.id).select('following');
  const { following } = await User.findById(req.user.id)
    .select('following -_id')
    .populate({
      path: 'following.user',
      select: 'name',
    });

  res.status(200).json({
    status: "success",
    following
  });
}));


module.exports = router;
