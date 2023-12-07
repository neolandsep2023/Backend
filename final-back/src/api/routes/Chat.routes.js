const { isAuth, isCommentOwner } = require('../../middleware/auth.middleware');
const { newComment, getUserChats } = require('../controllers/Chat.controller');

const ChatRoutes = require("express").Router();

ChatRoutes.post("/chat", [isAuth], newComment)
ChatRoutes.get("/getChats", [isAuth], getUserChats)




module.exports = ChatRoutes;