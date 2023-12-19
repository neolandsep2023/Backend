
const Comment = require('../models/Comment.model');
const User = require('../models/User.model');

//! ---------------- CREATE COMMENT -----------------

//!!En commented guardo un array de los id de los comentarios que te han puesto.
//!!En creator guardo un array con los id de los comentarios que has puesto.
const create = async (req, res, next) => {
  try {
    await Comment.syncIndexes();
    const { commented } = req.params;
    const creator = req.user._id;
    const body = req.body;
    const personaComentada = await User.findById(commented);

    const customBody = {
      creator: creator,
      creatorName: req.user.name, //?Persona comentante
      commented: commented,
      comment: body.comment,
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
    .json ("Error saving comment");
  }
};
//! --------------- GET by ID ----------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id).populate(
      'creator commented likes '
    ); 
    return res
      .status(commentById ? 200 : 404)
      .json(
        commentById
          ? commentById
          : 'no comments found ❌'
      );
  } catch (error) {
    return res.status(500)
    .json ("Error saving comment");
  }
};

//! --------------- GET ALL  commented----------------
const getAllReceived = async (req, res, next) => {
  try {
    const { commented } = req.params;
    const userById = await User.findById(commented);
    const allComments = await Comment.find({ commented: commented }).populate(
      'creator commented likes'
    ); 
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
    return res.status(500)
    .json ("Error reading comments");
    
};
}
//! --------------- GET ALL  commented----------------
const getAllSent = async (req, res, next) => {
    try {
      const { creator } = req.params;
      const userById = await User.findById(creator);
      const allComments = await Comment.find({ creator: creator }).populate(
        'creator commented likes'
      ); 
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
      return res.status(500)
      .json ("Error reading comments");
      
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
        
          { commented: id }, 
          { $pull: { commented: id } }
        );

        try {
       
          await User.updateMany(
        
            { creator: id }, 
            { $pull: { creator: id } } 
          );
         
        } catch (error) {
            return res.status(500)
            .json ("Error reading comments");
        }
      } catch (error) {
    
            return res.status(500)
            .json ("Error reading comments");
        ;
      }

      const findByIdComment = await Comment.findById(id); 
      return res.status(findByIdComment ? 404 : 200).json({
   
        deleteTest: findByIdComment ? false : true, 
      });
    } else {
      return res.status(404).json('this comment does not exist'); 
    }
  } catch (error) {
    return res.status(500)
      .json ("Error reading comments");
   
  }
};

module.exports = {
  create,
  getById,
  getAllReceived,
  getAllSent,
  deleteComment,
 
};
