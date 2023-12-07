
const Comment = require("../models/Comment.model");
const Room = require("../models/Room.model");
const { ObjectId } = require("mongodb");
const Post = require("../models/Post.model");
const User = require("../models/User.model");


//! ---------------------------------------------------------------------
//? ------------------------ CREATE USER REVIEW -------------------------
//! ---------------------------------------------------------------------
const createPostComment = async (req, res, next) => {

    try {
        const { idPost }= req.params   //id del POST
        const post = await Post.findById(idPost)
        const { _id } = req.user

        try {
            
            await Comment.syncIndexes()
    
            const commentBody = {
              textComment: req.body.textComment,
              type: "public",
              creator: _id
            };
            
            const newComment = new Comment(commentBody)
            const savedComment = await newComment.save()

            if(savedComment){

                    try {
                        await Post.findByIdAndUpdate(idPost, {
                            $push: { comments: savedComment}
                        })

                        try {

                            await User.findByIdAndUpdate(_id, {
                                $push: { sentComments: savedComment}
                            })

                            try {
                                
                                await Comment.findByIdAndUpdate(savedComment._id, {
                                    $push: { commentedPost: post }
                                })


                                  try {
                                    

                                    return res.status(200).json({
                                        commentCreated: await Comment.findById(savedComment._id).populate('creator commentedPost')
                                    })

                                  } catch (error) {
                                    return res.status(404).json({
                                        error: "Error giving response",
                                        message: error.message,
                                      });
                                  }
                                    
                        
                            } catch (error) {
                                return res.status(404).json({
                                    error: "Post and User not saved into Comment",
                                    message: error.message,
                                  });
                            }




                            
                        } catch (error) {
                            return res.status(404).json({
                                error: "Comment not saved into User",
                                message: error.message,
                              });
                        }

                        
                    } catch (error) {
                        return res.status(404).json({
                            error: "Comment not saved into Post",
                            message: error.message,
                          });
                    }
                
            }




        } catch (error) {
            return res.status(404).json({
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


//! ---------------------------------------------------------------------
//? ------------------------ CREATE ROOM REVIEW -------------------------
//! ---------------------------------------------------------------------


const createRoomReview = async (req, res, next) => {
  try {
    const commentBody = {
      textComment: req.body.textComment,
      creator: req.user._id,
      commentType: "public",
      commentedRoom: req.params.id,
    };
    const newComment = new Comment(commentBody);
    try {
      const savedComment = await newComment.save();
      console.log("entro", savedComment);
      if (savedComment) {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: { sentComments: newComment._id },
          });
          try {
            await Room.findByIdAndUpdate(req.params.id, {
              $push: { comments: newComment._id },
            });
            try {
              const createdComment =  await Comment.findById(savedComment._id).populate('creator commentedRoom');
              return res.status(200).json({
                  commentCreated: createdComment
              })
            } catch (error) {
            return res.status(404).json(error.message);
              
            }
          } catch (error) {
            return res.status(404).json("error updating room model");
          }
        } catch (error) {
          return res.status(404).json("error updating owner user comment ");
        }
      } else {
        return res.status(404).json("Error creating comment");
      }
    } catch (error) {
      return res.status(404).json(error.message);
    }
  } catch (error) {
    next(error);
    return res.status(500).json(error.message);
  }
};



//! ---------------------------------------------------------------------
//? ------------------------ CREATE USER REVIEW -------------------------
//! ---------------------------------------------------------------------

const createUserReview = async (req, res, next) => {
  try {
    const commentBody = {
      textComment: req.body.textComment,
      creator: req.user._id,
      commentType: "public",
      commentedUser: req.params.id,
    };
    const newComment = new Comment(commentBody);
    try {
      const savedComment = await newComment.save();
      console.log("entro", savedComment);
      if (savedComment) {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: { sentComments: newComment._id },
          });
          try {
            await User.findByIdAndUpdate(req.params.id, {
              $push: { receivedComments: newComment._id },
            });
            try {
              const createdComment =  await Comment.findById(savedComment._id).populate('creator commentedUser')
              return res.status(200).json({
                  commentCreated: createdComment
              })
            } catch (error) {
            return res.status(404).json("Error saving comment");
              
            }
          } catch (error) {
            return res.status(404).json("error updating other user model");
          }
        } catch (error) {
          return res.status(404).json("error updating owner user comment ");
        }
      } else {
        return res.status(404).json("Error creating comment");
      }
    } catch (error) {
      return res.status(404).json("error saving comment");
    }
  } catch (error) {
    next(error);
    return res.status(500).json(error.message);
  }
};






//! ---------------------------------------------------------------------
//? ------------------------------GET ALL -------------------------------
//! ---------------------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allComments = await Comment.find();
    if (allComments) {
      return res.status(200).json(allComments);
    } else {
      return res.status(404).json("Sorry, we could not find any comments");
    }
  } catch (error) {
    return next(error);
  }
};

//! ---------------------------------------------------------------------------------------
//? ----------------------------- DELETE --------------------------------------------------
//! ---------------------------------------------------------------------------------------

const deleteComment = async (req, res, next) => {
    console.log('entro')
    try {
      const { id } = req.params;    //ID DEL COMMENT
      const comment = await Comment.findByIdAndDelete(id); 
  


      if (comment) {
        
        try {
      
          await User.updateMany(
            { sentComments: id, receivedComments: id, likedComments: id }, 
            { $pull: { sentComments: id, receivedComments: id, likedComments: id } }
          );
  
          try {
         
            await Post.updateMany(
              { comments: id }, 
              { $pull: { comments: id } } 
            );

            try {
                
                await Room.updateMany(
          
                    { comments: id }, 
                    { $pull: { comments: id } } 
                  );

                  const findByIdComment = await Comment.findById(id); 
                  return res.status(findByIdComment ? 404 : 200).json({
               
                    deleteTest: findByIdComment ? false : true, 
                  });


            } catch (error) {
                return res.status(500)
                .json ("Error reading comments");
            }
           
          } catch (error) {
              return res.status(500)
              .json ("Error reading comments");
          }
        } catch (error) {
      
              return res.status(500)
              .json ("Error reading comments");
          ;
        }
  

      } else {
        return res.status(404).json('this comment does not exist'); 
      }
    } catch (error) {
      return res.status(500)
        .json ("Error reading comments");
     
    }
  };

//! ---------------------------------------------------------------------
//? ------------------------------LIKE--------------------------------
//! ---------------------------------------------------------------------
const toggleFavorite = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    //userIdPageDetail es el propietario del comentario
    const userIdPageDetail = req.body.userIdPageDetail;
    console.log(userIdPageDetail);

    const commentFav = await Comment.findById(commentId);
    const user = await User.findById(userId);

    if (!commentFav || !user) {
      return res.status(404).json("User or comment not found");
    }

    if (!commentFav.likes.includes(userId)) {
      await Comment.findByIdAndUpdate(commentId, { $push: { likes: userId } });
      await User.findByIdAndUpdate(userId, {
        $push: { comentsThatILike: commentFav._id },
      });
      const findCommentByUserUpdate = await Comment.find({
        referenceUser: new ObjectId(userIdPageDetail),
      })
        .sort({ createdAt: -1 })
        .populate("owner");

      return res.status(200).json({
        results: "Comment added to liked comments",
        data: findCommentByUserUpdate,
      });
    } else {
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
      await User.findByIdAndUpdate(userId, {
        $pull: { comentsThatILike: commentFav._id },
      });
      return res.status(200).json({
        result: "Comment removed from liked comments",
        data: await Comment.find({
          referenceUser: userIdPageDetail,
        })
          .sort({ createdAt: -1 })
          .populate("owner"),
      });
    }
  } catch (error) {
    return next(
      "Error while adding/removing comment to/from favourites",
      error
    );
  }
};

//! -----------------------------------------------------------------------
//? -------------------------------GET_BY_REFERENCE ---------------------------------
//! -----------------------------------------------------------------------

// const getByReference = async (req, res, next) => {
//   try {
//     const { refType, id } = req.params;

//     let comments;
//     if (refType === "Offer") {
//       comments = await Comment.find({ referenceOfferComment: id })
//         .sort({ createdAt: -1 })
//         .populate("owner referenceOfferComment");
//       return res.status(200).json(comments);
//     } else if (refType === "User") {
//       comments = await Comment.find({ referenceUser: id })
//         .sort({ createdAt: -1 })
//         .populate("owner");
//       return res.status(200).json(comments);
//     } else {
//       return res.status(404).json({
//         error: "Invalid reference type. It must be either 'User' or 'Offer'.",
//       });
//     }
//   } catch (error) {
//     return next(error);
//   }
// };





module.exports = {
  createPostComment,
  createRoomReview,
  createUserReview,
  getAll,
  deleteComment,
  toggleFavorite,
};

