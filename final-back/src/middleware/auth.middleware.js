const Post = require("../api/models/Post.model");
const User = require("../api/models/User.model");
const Comment = require("../api/models/Comment.model")
const { verifyToken } = require("../utils/token");

const dotenv = require("dotenv");
dotenv.config();

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    console.log(decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(error);
  }
};
//!------PARA ADMINS-------------------------

const isAuthAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (req.user.role !== "admin") {
      return next(new Error("Unauthorized, not admin"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

//!------PARA POST OWNERS-------------------------

const isPostOwner = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const { id } = req.params;
    const postById = await Post.findById(id);
    const author = postById.author;
    const authorOfPost = await User.findById(author);

    try {
      const decoded = verifyToken(token, process.env.JWT_SECRET);
      const tokenUser = await User.findById(decoded.id);

      console.log("AQUIIIIIIIII", authorOfPost.email == tokenUser.email); //! no se pq no deja id

      if (authorOfPost.email == tokenUser.email) {
        next();
      } else {
        return next(new Error("Not Owner"));
      }
    } catch (error) {}
  } catch (error) {
    return res.status(500).json({
      error: "Error is not owner",
      message: error.message,
    });
  }
};


//!------PARA COMMENT OWNERS-------------------------

const isCommentOwner = async (req, res, next) => {


  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id);
    const creator = commentById.creator;
    const authorOfComment = await User.findById(creator);

    try {
      const decoded = verifyToken(token, process.env.JWT_SECRET);
      const tokenUser = await User.findById(decoded.id);

      console.log("AQUIIIIIIIII", authorOfComment.email == tokenUser.email); //! no se pq no deja id
   
      if (authorOfComment.email == tokenUser.email) {
        next();
      } else {
        return next(new Error("Not Owner"));
      }
    } catch (error) {}
  } catch (error) {
    return res.status(500).json({
      error: "Error is not owner",
      message: error.message,
    });
  }
};




module.exports = {
  isAuth,
  isAuthAdmin,
  isPostOwner,
  isCommentOwner 
};
