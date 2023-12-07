const { isAuth, isCommentOwner } = require('../../middleware/auth.middleware');
const {
  createPostComment,
  createRoomReview,
  createUserReview,
  getAll,
  deleteComment,
  toggleFavorite

  }= require('../controllers/Comment.controller')

  
const CommentRoutes = require("express").Router();


CommentRoutes.post("/createPostComment/:idPost", [isAuth], createPostComment)
CommentRoutes.post("/createRoomReview/:id", [isAuth], createRoomReview)
CommentRoutes.post("/createUserReview/:id", [isAuth], createUserReview)
CommentRoutes.get("/getAll", getAll)
CommentRoutes.delete("/delete/:id", [isCommentOwner], deleteComment)



module.exports = CommentRoutes