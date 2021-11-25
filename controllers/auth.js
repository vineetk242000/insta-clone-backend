const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, password, userName } = req.body;

  if ((!name, !email, !password, !userName)) {
    res.json({
      success: false,
      statusCode: 400,
      msg: "One or more fields is missing",
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        res.json({
          success: false,
          statusCode: 401,
          msg: "Email is already Registered",
        });
      } else {
        User.findOne({ userName: userName }).then((user) => {
          if (user) {
            res.json({
              success: false,
              statusCode: 402,
              msg: "User name already taken",
            });
          } else {
            const newUser = new User({
              name,
              email,
              password,
              userName,
            });

            //password encryption
            bcrypt.genSalt(10, function (err, salt) {
              bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) throw err;
                newUser.password = hash;
                try {
                  newUser.save().then((user) => {
                    res
                      .status(200)
                      .json({ success: true, msg: "Account created" });
                  });
                } catch (err) {
                  res
                    .status(500)
                    .json({ success: false, msg: "Try again later" });
                }
              });
            });
          }
        });
      }
    });
  }
};

exports.login = async (req, res) => {
  const { userName, pass } = req.body;

  User.findOne({ userName: userName }).then((user) => {
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User id does not exist",
      });
    }

    bcrypt.compare(pass, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const payload = {
          id: user.id,
        };
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            if (!err) {
              res.status(200).json({ success: true, token });
            }
          }
        );
      } else {
        return res
          .status(401)
          .json({ success: false, msg: "Password Incorrect" });
      }
    });
  });
};
