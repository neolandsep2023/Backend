const { isAuth, isPostOwner } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
  createPost,
  getPostByIdPopulate,
  getPostById,
  getAllPostsPopulated,
  getAllPosts,
  postByType,
  getPostByLocation,
  deletePost,
  updatePost,
  searchPost,
  getByPostcode,
  getByProvince,
} = require("../controllers/Post.controller");

const PostRoutes = require("express").Router();

PostRoutes.get("/getById/:id", getPostById);
PostRoutes.get("/getById/populated/:id", getPostByIdPopulate);
PostRoutes.get("/getAll/", getAllPosts);
PostRoutes.get("/getAll/populated/", getAllPostsPopulated);
PostRoutes.get("/getByType/:type", postByType);
PostRoutes.get("/getByLocation/:location", getPostByLocation);
PostRoutes.get("/search", searchPost);
PostRoutes.get("/byPostcode/:postcode", getByPostcode);
PostRoutes.get("/byProvince/:province", getByProvince);

PostRoutes.post("/create", upload.single("image"), [isAuth], createPost);
PostRoutes.patch(
  "/update/:id",
  upload.single("image"),
  [isPostOwner],
  updatePost
);
PostRoutes.delete("/:id", [isPostOwner], deletePost);

module.exports = PostRoutes;
