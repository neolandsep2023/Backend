const { isAuth } = require("../../middleware/auth.middleware")


const {
    createPost,
    getPostByIdPopulate,
    getPostById,
    getAllPostsPopulated,
    getAllPosts,
    postByType,
    deletePost,
    updatePost
} = require("../controllers/Post.controller");

const PostRoutes = require("express").Router();

PostRoutes.post("/create/:location", [isAuth], createPost);
PostRoutes.get("/getbyid/:id", getPostById);
PostRoutes.get("/getbyidPopulate/:id", getPostByIdPopulate);
PostRoutes.get("/getall/", getAllPosts);
PostRoutes.get("/getall/", getAllPostsPopulated);
PostRoutes.get("/getbytype/:type", postByType);
PostRoutes.patch('/update/:id', updatePost);
PostRoutes.delete("/:id", deletePost);

module.exports = PostRoutes;
