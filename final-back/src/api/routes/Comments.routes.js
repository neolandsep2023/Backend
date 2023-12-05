
const { isAuth } = require("../../middleware/auth.middleware");
const { create, getById, getAllSent, getAllReceived, deleteComment } = require("../controllers/Comment.controller");

const CommentRoutes = require("express").Router();

CommentRoutes.post("/create/:commented", [isAuth], create);
CommentRoutes.get("/getById/:id", getById);
CommentRoutes.get("/getAllSent/:creator", getAllSent);
CommentRoutes.get("/getAllReceived/:commented", getAllReceived);
CommentRoutes.delete("/delete/:id", deleteComment);

module.exports = CommentRoutes