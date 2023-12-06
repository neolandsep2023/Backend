
const { isAuth } = require("../../middleware/auth.middleware");
const { create, getById, getAllSent, getAllReceived, deleteComment, createCommentPost, getAllPostComments } = require("../controllers/Comment.controller");

const CommentRoutes = require("express").Router();

CommentRoutes.post("/create/:commented", [isAuth], create);
CommentRoutes.post("/createPostComment/:commentPost", [isAuth], createCommentPost);
CommentRoutes.get("/getById/:id", getById);
CommentRoutes.get("/getAllPostComments/:post", getAllPostComments);
CommentRoutes.get("/getAllSent/:creator", getAllSent);
CommentRoutes.get("/getAllReceived/:commented", getAllReceived);
CommentRoutes.delete("/delete/:id", deleteComment);

module.exports = CommentRoutes