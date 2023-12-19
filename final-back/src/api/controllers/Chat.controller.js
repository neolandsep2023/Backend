const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const Chat = require("../models/Chat.model");

// //! -----------------------------------------------------------------------------
// //? -----------------------------CREATE NEW COMMENT -----------------------------
// //! -----------------------------------------------------------------------------
// //?------------------------------------------------------------------------------

const newComment = async (req, res, next) => {
  //el newComment va a hacerlo todo: checkear si hay un chat ya existente, ya sea con
  //el usuario que hace la peticion como userOne o como userTwo
  try {
    const commentBody = {
      textComment: req.body.textComment,
      creator: req.user._id,
      commentType: "privado",
      commentedUser: req.body.otherUser,
    };
    const newComment = new Comment(commentBody);
    try {
      const savedComment = await newComment.save();

      if (savedComment) {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: { sentComments: newComment._id },
          });
          try {
            await User.findByIdAndUpdate(req.body.otherUser, {
              $push: { receivedComments: newComment._id },
            });
            try {
              const userOne = req.user._id;
              const userTwo = req.body.otherUser;
              // const userTwo = req.body.referenceUser
              //   ? req.body.referenceUser
              //   : userReal.owner[0]._id;

              const chatExistOne = await Chat.findOne({
                userOne,
                userTwo,
              });
              //aqui busca un chat donde userOne tenga nuestro id y userTwo el id del recipiente

              const chatExistTwo = await Chat.findOne({
                userOne: userTwo,
                userTwo: userOne,
              });
              //aqui lo busco a la inversa, porque puede que el primer mensaje no lo haya
              //mandado yo, es decir, no seria userOne en el modelo de chat

              if (!chatExistOne && !chatExistTwo) {
                //si no existe ninguna de las dos, se crea un nuevo chat con
                // userOne : userOne._id + userTwo: userTwo._id
                //el user del mensajero (nosotros) y el recipiente
                console.log("Esto es un chat nuevo");
                const newChat = new Chat({ userOne, userTwo });
                newChat.comments.push(newComment._id);
                //pusheamos el id del mensaje mandado al nuevo chat
                try {
                  await newChat.save();
                  //guardamos la nueva instancia de chat, con su primer mensaje y los ids
                  //ya asentados de los dos participantes
                  const findNewChat = await Chat.findById(newChat._id);
                  if (findNewChat) {
                    try {
                      //aqui vamos a meter el chat creado en los chats del usuario
                      await User.findByIdAndUpdate(userOne, {
                        $push: { chats: newChat._id },
                      });

                      try {
                        await User.findByIdAndUpdate(userTwo, {
                          $push: { chats: newChat._id },
                        });
                        return res.status(200).json({
                          ChatSave: true,
                          chat: await Chat.findById(newChat._id),
                          userOneUpdate: await User.findById(userOne),
                          userTwoUpdate: await User.findById(userTwo),
                          newComment: await Comment.findById(savedComment._id),
                        });
                      } catch (error) {
                        return res.status(404).json("Couldn't update userTwo");
                      }
                    } catch (error) {
                      return res.status(404).json("Couldn't update userOne");
                    }
                  }
                } catch (error) {
                  return res.status(404).json(error.message);
                }
              } else {
                try {
                  console.log("Esto es un update del chat");
                  await Chat.findByIdAndUpdate(
                    //aqui comprobamos que en la clausula del if ha dado que una de las condiciones
                    //no se cumple, significa que hay un chat que contiene los ids de los usuarios.
                    //si existe el chatOne entonces le vamos a hacer el update a ese. Si no, la
                    //unica posibilidad que queda es que sea a la inversa
                    chatExistOne ? chatExistOne._id : chatExistTwo._id,
                    { $push: { comments: newComment.id } }
                  );
                  return res.status(200).json({
                    didChatExist: true,
                    newComment: await Comment.findById(savedComment._id),
                    chat: await Chat.findById(
                      chatExistOne ? chatExistOne._id : chatExistTwo._id
                    ).populate([
                      { path: "userOne", model: User },
                      { path: "userTwo", model: User },
                      { path: "comments", model: Comment, populate: "commentedUser creator" },
                    ])
                  });
                } catch (error) {
                  return res.status(404).json(error.message);
                }
              }
            } catch (error) {
              return next(error);
            }

            //! ---------------------------------------------------------------------------------------
            //! -------------------------------------------------------------------------------------

            //! ---------------------------------------------------------------------------------------
            //! -------------------------------------------------------------------------------------
          } catch (error) {
            return res
              .status(404)
              .json("Error updating receivedComments in the recipient.");
          }
        } catch (error) {
          return res.status(404).json("Error updating our sentComments array ");
        }
      } else {
        return res.status(404).json("Error creating comment");
      }
    } catch (error) {
      return res.status(404).json(error.message);
    }
  } catch (error) {
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};

//! --------------- GET by ID  POPULATED!!! ----------------
const getChatByIdPopulate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chatById = await Chat.findById(id).populate([
      { path: "userOne", model: User },
      { path: "userTwo", model: User },
      { path: "comments", model: Comment, populate: "commentedUser creator" },
    ]);
    return res
      .status(chatById ? 200 : 404)
      .json(chatById ? chatById : "post not found");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//aqui hacemos un populado de un populado. Cogemos user y populamos chats,
//y a su vez, populamos lo que hay dentro de chats. Path es como se llama la clave que vamos a popular, y model
//al modelo que pertenece, como para que sepa donde encontrarlo.
const getUserChats = async (req, res, next) => {
  const { id } = req.user;
  const userChats = await User.findById(id).populate({
    path: "chats",
    populate: [
      { path: "userOne", model: User },
      { path: "userTwo", model: User },
      { path: "comments", model: Comment, populate: "commentedUser creator" },
    ],
  });
  return res.status(200).json(userChats);
};

module.exports = { getUserChats, newComment, getChatByIdPopulate };
