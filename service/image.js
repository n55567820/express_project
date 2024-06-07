const multer = require("multer");
const path = require("path");

const upload = multer({
  limits: {
    //最大文件大小(2mb)
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
    }
    cb(null, true);
  },
}).any();
// any() 會設定 req.files = file

module.exports = upload;
