
const { isAuth } = require("../../middleware/auth.middleware");
const {
 
} = require("../controllers/Comment.controller");
const { getAllReceived, getAllSent, create, getById, deleteComment } = require("../controllers/comment.controllers");

const CommentRoutes = require("express").Router();

CommentRoutes.post("/create/:commented", [isAuth], create);
CommentRoutes.post("/createpodium/:commented",[isAuth], createPodiumComment);
CommentRoutes.get("/getbyid/:id", getById);
CommentRoutes.get("/getallsent/:creator", getAllSent);
CommentRoutes.get("/getallreceived/:commented", getAllReceived);
CommentRoutes.delete("/delete/:id", deleteComment);

module.exports = CommentRoutes;