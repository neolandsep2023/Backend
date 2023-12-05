
const User = require('../models/User.model');
const Comment = require('../models/comment.model');
//! ---------------- CREATE COMMENT -----------------
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
    const comment = await Comment.findByIdAndDelete(id); //? buscamos el equipo y lo eliminamos

    if (comment) {
      //? si el equipo que queremos eliminar existe (tiene que hacerlo para poder eliminarlo)

      try {
        //? --------------------------------------------- ELIMINAMOS AL COMMENT, DEL ELEVEN
        await Eleven.updateMany(
          //? --------- ahora estamos cambiando en el model de Eleven para poder quitar el equipo que ya no existe
          { comments: id }, //? --------------------------- queremos cambiar lo que sea que haya que cambiar en esta propiedad del model, si se omite se dice que se cambia cualquier conincidencia en todo el modelo. es la condición
          { $pull: { comments: id } } //? ------------------- estamos diciendo que quite de la propiedad comments, el id indicado, es decir el del equipo que se ha eliminado. es la ejecución
        );

        try {
          //? ----------------------------------------- ELIMINAMOS AL FAVCOMMENT DEL USER
          await User.updateMany(
            //? ------- ahora estamos cambiando en el model de User para poder quitar el favcomment que ya no existe
            { favComments: id }, //? -------------------- condición/ubicación del cambio (eliminación)
            { $pull: { favComments: id } } //? ------------ ejecución
          );
          try {
            //? ----------------------------------------- ELIMINAMOS AL FAVCOMMENT DEL PODIUM
            await Podium.updateMany(
              //? ------- ahora estamos cambiando en el model de User para poder quitar el favcomment que ya no existe
              { comments: id }, //? -------------------- condición/ubicación del cambio (eliminación)
              { $pull: { comments: id } } //? ------------ ejecución
            );
            try {
              //? ----------------------------------------- ELIMINAMOS AL FAVCOMMENT DEL Lifter
              await Lifter.updateMany(
                { comments: id },
                { $pull: { comments: id } }
              );
            } catch (error) {
              return next(
                setError(
                  500,
                  error.message ||
                    'Error al eliminar el comentario del Lifter ❌'
                )
              );
            }
          } catch (error) {
            return next(
              setError(
                500,
                error.message || 'Error al eliminar el comentario del podium ❌'
              )
            );
          }
        } catch (error) {
          return next(
            setError(
              500,
              error.message || 'Error al eliminar el comentario del user ❌'
            )
          );
        }
      } catch (error) {
        return next(
          setError(
            500,
            error.message || 'Error al eliminar el comentario del eleven ❌'
          )
        );
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
    return next(
      setError(
        500,
        error.message || 'Error general al eliminar tu comentario ❌'
      )
    );
  }
};

module.exports = {
  create,
  getById,
  getAllReceived,
  getAllSent,
  deleteComment,
 
};
