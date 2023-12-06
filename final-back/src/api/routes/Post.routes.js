const { isAuth, isPostOwner } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");


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

PostRoutes.post("/create", upload.single('image'), [isAuth], createPost);
PostRoutes.get("/getById/:id", getPostById);
PostRoutes.get("/getById/populated/:id", getPostByIdPopulate);
PostRoutes.get("/getAll/", getAllPosts);
PostRoutes.get("/getAll/populated/", getAllPostsPopulated);
PostRoutes.get("/getByType/:type", postByType);
PostRoutes.patch('/update/:id',upload.single('image'), [isPostOwner], updatePost);
PostRoutes.delete("/:id", [isPostOwner], deletePost);

module.exports = PostRoutes;
