const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");

//! ---------------- CREATE -----------------

const createPost = async (req, res) => {
  let catchImg = req.file?.path; //TODO-------- ESTO TIENE QUE SER UN ARRAY DE FOTOS??? --------
  try {
    await Post.syncIndexes();
    const body = req?.body;
    const newPost = new Post(req?.body);
    const user = req?.user;
    console.log("entro aqui", user._id);

    newPost.author = user._id;
    newPost.image = catchImg;
    newPost.title = body.title;
    newPost.text = body.text;
    newPost.type = body.type;
    newPost.location = body.location;
    console.log(newPost);

    const savedPost = await newPost.save();

    try {
      await User.findByIdAndUpdate(
        user._id, //---- que se creen los posts en el user
        { $push: { myPosts: savedPost._id } }
      );

      return res
        .status(savedPost ? 200 : 404)
        .json(savedPost ? savedPost : "Error saving post");
    } catch (error) {
      return res.status(404).json({
        error: "no se encontro por id",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! --------------- GET by ID  POPULATED!!! ----------------
const getPostByIdPopulate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postById = await Post.findById(id).populate("author likes comments"); //? cogemos el elemento (eleven) identificandola a través del id, que es único
    return res
      .status(postById ? 200 : 404)
      .json(postById ? postById : "post not found");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! --------------- GET by ID  NORMAL ----------------
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postById = await Post.findById(id);
    return res
      .status(postById ? 200 : 404)
      .json(postById ? postById : "post not found");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! --------------- GET ALL -- POPULATED!! ----------------
const getAllPostsPopulated = async (req, res, next) => {
  try {
    const allPosts = await Post.find().populate("author likes comments");

    return res
      .status(allPosts.length > 0 ? 200 : 404)
      .json(allPosts.length > 0 ? allPosts : "posts Not Found");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! --------------- GET ALL NORMAL ----------------
const getAllPosts = async (req, res, next) => {
  try {
    const allPosts = await Post.find();
    return res
      .status(allPosts.length > 0 ? 200 : 404)
      .json(allPosts.length > 0 ? allPosts : "posts Not Found");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

const getByPostcode = async (req, res, next) => {
  try {
    const { postcode } = parseInt(req.params);
    const roomByPostcode = await Room.find({ postcode: postcode }).populate(
      "postedBy"
    );
    return roomByName
      ? res.status(200).json(roomByPostcode)
      : res.status(404).json("we couldn't find the room");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

const getByProvince = async (req, res, next) => {
  try {
    const { province } = req.params;
    const roomByProvince = await Room.find({ province: province }).populate(
      "postedBy"
    );
    return roomByName
      ? res.status(200).json(roomByProvince)
      : res.status(404).json("we couldn't find the room");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ---------------- GET BY TYPE ------------------

const postByType = async (req, res, next) => {
  const { type } = req.params;
  try {
    const postsByType = await Post.find({
      type: { $in: type },
      /*  --EX  En este caso, $IN lo que hace es buscar que objetos
            --EX cumplen con la categoria que tenemos. Es decir, 
            --EX encuentra los lifters que IN weightCategory tengan category  */
    });
    return res.status(200).json(postsByType);
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ---------------- UPDATE -----------------

const updatePost = async (req, res) => {
  let catchImg = req.file?.path; //TODO-------- ESTO TIENE QUE SER UN ARRAY DE FOTOS --------
  try {
    await Post.syncIndexes();
    const { id } = req.params;
    try {
      const postById = await Post.findById(id);

      if (postById) {
        const customBody = {
          image: req.file?.path ? catchImg : postById.image,
          title: req.body?.title ? req.body.title : postById.title,
          text: req.body?.text ? req.body.text : postById.text,
          location: req.body?.location ? req.body.location : postById.location,
          postcode: req.body?.postcode ? req.body.postcode : roomById.postcode,
          province: req.body?.province ? req.body.province : roomById.province,
          author: postById.author,
          type: postById.type,
          likes: postById.likes,
          comments: postById.comments,
        };

        try {
          await Post.findByIdAndUpdate(id, customBody).populate(
            "author likes comments"
          );
          if (req.file?.path) {
            deleteImgCloudinary(postById.image);
          }

          //!           -------------------
          //!           | RUNTIME TESTING |
          //!           -------------------

          const postByIdUpdated = await Post.findById(id);
          const elementUpdate = Object.keys(req.body);
          let test = [];

          elementUpdate.forEach((item) => {
            if (req.body[item] === postByIdUpdated[item]) {
              if (req.body[item] != postById[item]) {
                //si no es la misma que la antigua
                test[item] = true;
              } else {
                test[item] = "same old info";
              }
            } else {
              test[item] = false;
            }
          });
          //si la imagen existe, añade al objeto del test
          if (catchImg) {
            postByIdUpdated.image === catchImg
              ? (test = { ...test, file: true })
              : (test = { ...test, file: false });
          }

          // si hay un false en algunos de esos test vamos a localizar el error

          let acc = 0;
          for (let clave in test) {
            test[clave] == false && acc++;
          }
          if (acc > 0) {
            return res.status(404).json({
              postByIdUpdated,
              update: false,
              dataTest: test,
            });
          } else {
            return res.status(200).json({
              postByIdUpdated,
              update: true,
              dataTest: test,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "Error al encontrar al id",
            message: error.message,
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ---------------- SEARCH -----------------

const searchPost = async (req, res, next) => {
  try {
    const { search } = req.body;
    const postByTitleSearch = await Post.find({
      title: { $regex: search, $options: "i" },
    }).populate("author likes");
    const postByTextSearch = await Post.find({
      text: { $regex: search, $options: "i" },
    }).populate("author likes");

    if (postByTitleSearch[0] || postByTextSearch[0]) {
      console.log("entro");
      return res.status(200).json({
        postByTitleSearch,
        postByTextSearch,
      });
    } else {
      return res.status(404).json("Not Found");
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ----------------  GET BY LOCATION -----------------

const getPostByLocation = async (req, res, next) => {
  const { location } = req.params;
  try {
    const postsByLocation = await Post.find({
      location: { $in: location },
    });
    return res.status(200).json(postsByLocation);
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ---------------- DELETE -----------------

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (post) {
      try {
        await User.updateMany(
          { myPosts: id, likedPosts: id },
          { $pull: { myPosts: id, likedPosts: id } }
        );

        try {
          await Comment.updateMany({ posts: id }, { posts: id });

          const postById = await Post.findById(id);

          return res.status(postById ? 404 : 200).json({
            deleteTest: postById ? false : true,
          });
        } catch (error) {
          return res.status(500).json({
            error: "Error al borrar el post del user",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(500).json({
          error: "Error al borrar el post del user",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json("Post not found"); //si no existe el post no se puede eliminar
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPostByIdPopulate,
  getPostById,
  getAllPostsPopulated,
  getAllPosts,
  getPostByLocation,
  postByType,
  deletePost,
  updatePost,
  searchPost,
  getByPostcode,
  getByProvince,
};
