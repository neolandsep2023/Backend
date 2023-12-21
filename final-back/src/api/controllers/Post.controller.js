const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Room = require("../models/Room.model");

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

    const datedPosts = await Post.updateMany(
      {},
      { $convert: { input: "$createdAt", to: "date" } }
    );

    try {
      await User.findByIdAndUpdate(
        user._id, //---- que se creen los posts en el user
        { $push: { myPosts: savedPost._id } }
      );

      if(savedPost){
        return res.status(200).json({
          savedPost,
          datedPosts
        })
      }else{
        return res.status(404).json("Error saving post")
      }

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
    const postById = await Post.findById(id).populate("author likes comments roommates room"); //? cogemos el elemento (eleven) identificandola a través del id, que es único
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
    const allPosts = await Post.find().sort({ createdAt: -1 }).populate("author likes comments");


    if(allPosts.length>0){
      return res.status(200).json({
        allPosts
      })

    }else{
      return res.status(404).json("posts Not Found")
    }

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


//! --------------- GET BY POSTCODE ----------------

const getByPostcode = async (req, res, next) => {
  try {
    const { postcode } = parseInt(req.params);
    const postByPostcode = await Post.find({ postcode: postcode }).populate(
      "author"
    );
    return postByPostcode
      ? res.status(200).json(postByPostcode)
      : res.status(404).json("we couldn't find the room");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};


//! --------------- GET BY PROVINCE ----------------
const getByProvince = async (req, res, next) => {
  try {
    const { province } = req.params;
    const postByProvince = await Post.find({ province: province }).sort({ createdAt: -1 }).populate(
      "author"
    );
    return postByProvince
      ? res.status(200).json(postByProvince)
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
    }).sort({ createdAt: -1 }).populate("author likes comments");
    return res.status(200).json(postsByType);
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

const allPostByType = async (req, res, next) => {
  console.log(req.params)
  const { type } = req.params;
  try {
    const postsByType = await Post.find({
      type: { $in: type },
      /*  --EX  En este caso, $IN lo que hace es buscar que objetos
            --EX cumplen con la categoria que tenemos. Es decir, 
            --EX encuentra los lifters que IN weightCategory tengan category  */
    }).sort({ createdAt: -1 }).populate("author likes comments");


    console.log(postsByType)
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
  let catchImg = req.file?.path; 
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
          type: postById.type,
          preferredGender: req.body?.preferredGender ? req.body.preferredGender : postById.preferredGender,
          preferredAge: req.body?.preferredAge ? req.body.preferredAge : postById.preferredAge,
          postcode: postById.postcode,
          province: postById.province,
          price: req.body?.price ? parseInt(req.body.price) : postById.price,
          deposit: req.body?.deposit ? JSON.parse(req.body.deposit) : postById.deposit,
          depositPrice: req.body?.depositPrice ? parseInt(req.body.depositPrice) : postById.depositPrice,
          author: postById.author,
          room: req.body?.room ? req.body.room : postById.room,
          roommates: req.body?.roommates ? req.body.roommates : postById.roommates,
          likes: postById.likes,
          comments: postById.comments,
          saved: postById.saved,
        };
        console.log("customBody", customBody)


        try {
          await Post.findByIdAndUpdate(id, customBody).populate(
            "author likes comments roommates"
          );
          if (req.file?.path) {
            deleteImgCloudinary(postById.image);
          }

          //!           -------------------
          //!           | RUNTIME TESTING |
          //!           -------------------

          const postByIdUpdated = await Post.findById(id);
          console.log(postByIdUpdated.deposit, typeof(postByIdUpdated.deposit))
          console.log(customBody.deposit, typeof(customBody.deposit))
  
          const elementUpdate = Object.keys(req.body);
          let test = {};

          elementUpdate.forEach((item) => {
            // Use strict equality (===) for comparison
            if (customBody[item] === postByIdUpdated[item]) {
              if (customBody[item] !== postById[item]) {
                // If not the same as the old value
                test[item] = true;
              } else {
                test[item] = "same old info";
              }
            } else {
              test[item] = false;
            }
          });

          // If the image exists, add it to the test object
          if (catchImg) {
            test.file = postByIdUpdated.image === catchImg;
          }

          // Count the number of false values in the test object
          const acc = Object.values(test).filter((value) => value === false).length;

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
            error: "Error al actualizar por id",
            message: error.message,
          });
        }
      }
    } catch (error) {
      return res.status(404).json({
        error: "Error encontrando el post",
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
//! ---------------- TOGGLE ROOMMATES -------------
const toggleRoommates = async (req, res) => {
  console.log("entro en toggle")
 try {
  const { id, roommates } = req.params;
  const postById = await Post.findById(id);
  if (postById) {
    const arrayIdRoommates = roommates.split(",");

    Promise.all([
      arrayIdRoommates.forEach(async (roommate) => {
        if (postById.roommates.includes(roommate)) {
          try {
            await Post.findByIdAndUpdate(id, {
              $pull: {roommates: roommate},
            })
            try {
              await User.findByIdAndUpdate(roommate, {
                $pull: {postsIAmIn: id}
              })
            } catch (error) {
              return res.status(404).json({message: "Error al quitar el post del user", error: error.message})
            }
          } catch (error) {
            return res.status(404).json({message: "Error al quitar el user del post", error: error.message})
          }
        } else {
          try {
            await Post.findByIdAndUpdate(id, {
              $push: {roommates: roommate},
            })
            try {
              await User.findByIdAndUpdate(roommate, {
                $push: {postsIAmIn: id}
              })
            } catch (error) {
              return res.status(404).json({message: "Error al añadir el post al user", error: error.message})
            }
          } catch (error) {
            return res.status(404).json({message: "Error al añadir el user al post", error: error.message})
          }
        }
      }),
    ]).then(async () => {
      return res.status(200).json({
        dataUpdate: await Post.findById(id).populate("author room likes saved comments") //? falta roomates que lo he quitado para poder ver si el user se ha añadido y renderizar cietas cosas si si o si no
      })
    })
  } else {
    return res.status(404).json("este post no existe")
  }
 } catch (error) {
  return res.status(500).json({message: "Error general en el catch", error: error.message})
 }
};

//! ---------------- TOGGLE ROOM -------------
const toggleRoom = async (req, res) => {
  console.log("entro en toggle")
 try {
  const { id, room } = req.params;
  console.log(id, room)
  const postById = await Post.findById(id);
  if (postById) {
    const arrayIdRoom = room.split(",");
    console.log(postById.room)

    Promise.all([
      arrayIdRoom.forEach(async (roomId) => {
        console.log(roomId)
        if (postById.room.includes(roomId)) {
          console.log("entro en pull")
          try {
            await Post.findByIdAndUpdate(id, {
              $pull: {room: roomId},
            })
            try {
              await Room.findByIdAndUpdate(roomId, {
                $pull: {post: id}
              })
            } catch (error) {
              return res.status(404).json({message: "Error al quitar el post del room", error: error.message})
            }
          } catch (error) {
            return res.status(404).json({message: "Error al quitar el room del post", error: error.message})
          }
        } else {
          console.log("entro en push")
          try {
            await Post.findByIdAndUpdate(id, {
              $push: {room: roomId},
            })
            try {
              await Room.findByIdAndUpdate(roomId, {
                $push: {post: id}
              })
            } catch (error) {
              return res.status(404).json({message: "Error al añadir el post al room", error: error.message})
            }
          } catch (error) {
            return res.status(404).json({message: "Error al añadir el room al post", error: error.message})
          }
        }
      }),
    ]).then(async () => {
      const dataUpdate = await Post.findById(id)
      setTimeout(() => {
        return res.status(200).json(dataUpdate)
      }, "300")
    })
  } else {
    return res.status(404).json("este post no existe")
  }
 } catch (error) {
  return res.status(500).json({message: "Error general en el catch", error: error.message})
 }
};


//! ---------------- SEARCH -----------------

const searchPost = async (req, res, next) => {

  try {
    let resArrayRoommSeeker = []
    let resArrayRoommateSeeker = []

    const { search } = req.params;
    const roomSeekerTitleSearch = await Post.find({
      type: { $in: "RoomSeeker" },
      title: { $regex: search, $options: "i" },
    }).sort({ createdAt: -1 }).populate("author likes");
    const roomSeekerTextSearch = await Post.find({
      type: { $in: "RoomSeeker" },
      text: { $regex: search, $options: "i" },
    }).sort({ createdAt: -1 }).populate("author likes");

    if (roomSeekerTitleSearch[0] || roomSeekerTextSearch[0]) {
      
      roomSeekerTitleSearch.forEach((post)=>{
        resArrayRoommSeeker.push(post)
      })
      roomSeekerTextSearch.forEach((post)=>{
        resArrayRoommSeeker.push(post)
      })
    } else {
      return res.status(404).json("Not Found");
    }

    try {
      

      const roommateSeekerTitleSearch = await Post.find({
        type: { $in: "RoommateSeeker" },
        title: { $regex: search, $options: "i" },
      }).sort({ createdAt: -1 }).populate("author likes");
      const roommateSeekerTextSearch = await Post.find({
        type: { $in: "RoommateSeeker" },
        text: { $regex: search, $options: "i" },
      }).sort({ createdAt: -1 }).populate("author likes");
  
      if (roommateSeekerTitleSearch[0] || roommateSeekerTextSearch[0]) {
        
        roommateSeekerTitleSearch.forEach((post)=>{
          resArrayRoommateSeeker.push(post)
        })
        roommateSeekerTextSearch.forEach((post)=>{
          resArrayRoommateSeeker.push(post)
        })


 } else {
      return res.status(404).json("Not Found");
    }

   



      console.log("entro");
      return res.status(200).json({
        resArrayRoommSeeker,
        resArrayRoommateSeeker
      });




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

//! ----------------  GET BY LOCATION -----------------

const getPostByLocation = async (req, res, next) => {
  console.log("entroooo", province)
  const { province } = req.params;
  try {
    const postsByLocation = await Post.find({
      province: { $in: province },
    }).sort({ createdAt: -1 });
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
  allPostByType,
  deletePost,
  updatePost,
  searchPost,
  getByPostcode,
  getByProvince,
  toggleRoommates,
  toggleRoom
};
