const aws = require("aws-sdk");

exports.s3 = new aws.S3({
  region: `${process.env.S3_REGION}`,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
});
