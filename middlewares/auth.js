const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //If middleware doesn't receives any token with the request from  the frontend then return error
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "You need to be logged in to visit this route",
    });
  }

  try {
    // decoding the token to extract userId of the user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // search for the user in the user db with the decoded userId from the token

    const person = await User.findById(decoded.id).select("-password");

    if (!person) {
      // If the user is not found in the db then return  error
      return res.status(403).json({
        success: false,
        message: "No user found for the given userId",
      });
    }
    // pass the user value to the next  middlewares
    req.user = person;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      message: "You need to be logged in to visit this route",
    });
  }
};
