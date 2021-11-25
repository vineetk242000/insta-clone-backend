const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3 } = require("./awsConfig");

// creating the diskstorage for the multer to store upcoming files from the frontend
const fileStorage = multerS3({
  acl: "public-read",
  s3: s3,
  bucket: process.env.S3_BUCKET,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: "TESTING_METADATA" });
  },
  key: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

// filtering out the other files other than jpg,jpeg,png  coming from the frontend
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploadFile = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).fields([
  { name: "images", maxCount: 10 },
  { name: "avatar", maxCount: 1 },
]);
module.exports = uploadFile;
