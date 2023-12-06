
const User = require('../models/User.model');
const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');

//! ---------------- CREATE COMMENT USER-----------------
const create = async (req, res, next) => {
  try {
    await Comment.syncIndexes();
    const { commented } = req.params;
    const creator = req.user._id;
    const body = req.body;
    const personaComentada = await User.findById(commented);
    console.log(personaComentada)

    const customBody = {
      creator: creator,
      nameComentador: req.user.name, //?Persona comentante
      commented: commented,
      textComment: body.textComment,
      rating: body.rating,
      name: personaComentada.name,
      image: req.user.image,   //?Persona comentante
    };
    const newComment = new Comment(customBody);
    const saveComment = await newComment.save();
    await User.findByIdAndUpdate(
      commented, //? ----- hacemos que sea recíproco, lo mete en el array de comentados del que recibe
      { $push: { receivedComments: saveComment._id } }
    );
    await User.findByIdAndUpdate(
      creator, //? ----- hacemos que sea recíproco, lo mete en el array de comentantes
      { $push: { sentComments: saveComment._id } }
    );
    return res
      .status(saveComment ? 200 : 404)
      .json(saveComment ? saveComment : 'Error saving comment');
  } catch (error) {
    return res.status(500)
    .json ("General error");
  }
};
//! ---------------- CREATE COMMENT POST-----------------
const createCommentPost = async (req, res, next) => {
  try {
    await Comment.syncIndexes();
    const { commentPost } = req.params;
    const creator = req.user;
    const body = req.body;
    const postComentado = await User.findById(commentPost);

    const customBody = {
      creator: creator._id,
      nameComentador:creator.name, //?Persona comentante
      commentPost: commentPost,
      textComment: body.textComment,
      rating: body.rating,
      image: creator.image,   //?Persona comentante
    };
    const newComment = new Comment(customBody);
    const saveComment = await newComment.save();
    await Post.findByIdAndUpdate(
      commentPost, 
      { $push: { comments: saveComment._id } }
    );
    await User.findByIdAndUpdate(
      creator, //? ----- hacemos que sea recíproco, lo mete en el array de comentantes
      { $push: { sentComments: saveComment._id } }
    );
    return res
      .status(saveComment ? 200 : 404)
      .json(saveComment ? saveComment : 'Error saving comment');
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: 'Error en el catch',
      message: error.message,
    });
  }
};
//! --------------- GET by ID ----------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id)
   
    return res
      .status(commentById ? 200 : 404)
      .json(
        commentById
          ? commentById
          : 'no comments found ❌'
      );
  } catch (error) {
    return res.status(500).json({
      error: 'Error en el catch',
      message: error.message,
    });
  }
};

//! --------------- GET ALL  commented----------------
const getAllReceived = async (req, res, next) => {
  try {
    const { commented } = req.params;
    const userById = await User.findById(commented);
    const allComments = await Comment.find({ commented: commented })
    if (userById) {
      return res
        .status(allComments.length > 0 ? 200 : 404) 
        .json(
          allComments.length > 0
            ? allComments
            : `No se han encontrado comentarios en ${userById.name} en la DB `
        );
    } else {
      return res
        .status(404)
        .json(`"this user does not exist`);
    }
  } catch (error) {
   return res.status(500).json({
            error: 'Error en el catch',
            message: error.message,
          });
    
};
}
//! --------------- GET ALL  sent----------------
const getAllSent = async (req, res, next) => {
    try {
      const { creator } = req.params;
      const userById = await User.findById(creator);
      const allComments = await Comment.find({ creator: creator })
      
   
      if (userById) {
        return res
          .status(allComments.length > 0 ? 200 : 404) 
          .json(
            allComments.length > 0
              ? allComments
              : `No se han encontrado comentarios en ${userById.name} en la DB `
          );
      } else {
        return res
          .status(404)
          .json(`"this user does not exist`);
      }
    } catch (error) {
      return res.status(500).json({
        error: 'Error en el catch',
        message: error.message,
      });
      
  };
}
//! --------------- GET ALL  comments post----------------
const getAllPostComments = async (req, res, next) => {
  try {
    const { post} = req.params;
    const postById = await Post.findById(post);
    const allComments = await Comment.find({ commentPost: post })
    if (postById) {
      return res
        .status(allComments.length > 0 ? 200 : 404) 
        .json(
          allComments.length > 0
            ? allComments
            : `No se han encontrado comentarios en ${postById} en la DB `
        );
    } else {
      return res
        .status(404)
        .json(`"this user does not exist`);
    }
  } catch (error) {
   return res.status(500).json({
            error: 'Error en el catch',
            message: error.message,
          });
    
};
}



//! ---------------- DELETE -----------------
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);

    if (comment) {
  

      try {
     
        await User.updateMany(
         
          { sentComments: id },
          { $pull: { sentComments: id } }
        );
      try {
     
        await Post.updateMany(
         
          { comments: id },
          { $pull: {comments: id } }
        );

        try {
        
          await User.updateMany(
         
            { receivedComments: id }, 
            { $pull: { receivedComments: id } }
          );
         
        } catch (error) {
          return res.status(500)
      .json ("Error deleting received");
        }
      } catch (error) {
        return res.status(500)
        .json ("Error deleting post comments");
      }
      } catch (error) {
        return res.status(500)
        .json ("Error deleting sent");
      }

      const findByIdComment = await Comment.findById(id); //? hemos encontrado este equipo? no debería existir porque lo hemos eliminado al ppio
      return res.status(findByIdComment ? 404 : 200).json({
        //? si se encuentra hay un error, porque no se ha eliminado
        deleteTest: findByIdComment ? false : true, //? si existe, el test ha dado fallo y si no existe ha aprobado el test
      });
    } else {
      return res.status(404).json('este comentario no existe ❌'); //? si no existe el jugador antes de eliminarlo hay que dar error porque el jugador seleccionado para borrar no existia en un primer momento
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Error en el catch',
      message: error.message,
    });
  }
};

module.exports = {
  create,
  createCommentPost,
  getById,
  getAllReceived,
  getAllPostComments,
  getAllSent,
  deleteComment,
 
};
