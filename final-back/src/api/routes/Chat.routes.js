const { isAuth, isCommentOwner } = require('../../middleware/auth.middleware');
const { newComment, getUserChats, getChatByIdPopulate } = require('../controllers/Chat.controller');

const ChatRoutes = require("express").Router();

ChatRoutes.post("/chat", [isAuth], newComment)
ChatRoutes.get("/getChats", [isAuth], getUserChats)
ChatRoutes.get("/getChat/:id", getChatByIdPopulate)




module.exports = ChatRoutes;