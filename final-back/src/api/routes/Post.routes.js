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
PostRoutes.get("/getById/:id", getPostById);
PostRoutes.get("/getById/populated/:id", getPostByIdPopulate);
PostRoutes.get("/getAll/", getAllPosts);
PostRoutes.get("/getAll/populated/", getAllPostsPopulated);
PostRoutes.get("/getByType/:type", postByType);
PostRoutes.patch('/update/:id', updatePost);
PostRoutes.delete("/:id", deletePost);

module.exports = PostRoutes;
