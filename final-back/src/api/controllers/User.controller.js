const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//<!--IMP                                        UTILS / HELPERS                                                 ->
const randomCode = require("../../utils/randomCode");
const randomPassword = require("../../utils/randomPassword");
const enumCheck = require("../../utils/enumCheck");
const sendEmail = require("../../utils/sendEmail");
const { generateToken } = require("../../utils/token");
const { getSentEmail, setSentEmail } = require("../../state/state.data");

//<!--IMP                                           LIBRARIES                                                    ->
const validator = require("validator");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

//<!--IMP                                             MODELS                                                     ->
const User = require("../models/User.model");
const interestsEnum = require("../../data/interestsEnum");
const Post = require("../models/Post.model");
const Room = require("../models/Room.model");
const Comment = require("../models/Comment.model");

//<!--SEC                                   REDIRECT  REGISTRATION                                                   ->
//WORKS CORRECTLY

const redirectRegister = async (req, res, next) => {
  let catchImage = req.file?.path;
  console.log(req.body);
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const doesUserExist = await User.findOne(
      { username: req.body.username },
      { email: req.body.email }
    );
    if (!doesUserExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      //   if(req.body.interests) {
      //     req.body.interests.forEach(element => {
      //         interestsEnum('interests', item)
      //     });
      //   }
      try {
        const savedUser = await newUser.save();
        if (savedUser) {
          return res.redirect(
            307,
            `http://localhost:8081/api/v1/users/register/sendMail/${savedUser._id}`
          );
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImage);
        return res.status(404).json({
          error: "Error in save catch",
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImage);
      return res.status(409).json("This user already exists.");
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};



//<!--SEC                                   REGISTER GOOGLE                                                  ->

const registerGoogle = async (req, res, next) => {
  console.log(req);
  const customBody = {
    email: req.body.email,
    name: req.body.name,
    lastName: req?.body?.lastName ? req?.body?.lastName : null,
    confirmationCode: randomCode(),
    isVerified: true,
    image: req.body.image,
    password: randomPassword(),
    username: req.body.username,
    googleSignUp: true,
  };
console.log(customBody.password)
  try {
    await User.syncIndexes();
      
      const doesUserExist = await User.findOne(
        { username: req.body.username },
        { email: req.body.email }
      );

    if (!doesUserExist) {
      const newUser = new User(customBody);

      try {
        console.log('HOLAAAAAAAAAAAAAAA', newUser);
        const savedUser = await newUser.save();
        console.log('lo guardooooo', savedUser);

        if (savedUser) {
          console.log('entro');
          return res.status(200).json(savedUser);
        }
      } catch (error) {
        console.error('Error during save:', error);
        return res.status(500).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImage);
      return res.status(409).json('This user already exists.');
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    console.error('Error in try-catch block:', error);

    return res.status(500).json({
      error: 'Error in the catch block',
      message: error.message,
    }) && next(error);
  }
};

//el problema esta en que el modelo de usuario hace un pre.save de la contrasena, por lo que no puede guardar
//el usuario que viene desde google(no tiene contrasena). Lo mejor que se me puede ocurrir es gestionar la respuesta y
//quiza hacer un controlador que te redirija a otro controlador segun que login hayas usado y que complete el
//usuario de forma dependiente del metodo. Se puede hacer tambien en el mismo controlador, pero no se gestionar
//la respuesta y condicionalmente hacerlo. if req.loginMethod == normal, y en el form meterle que el login method sea normal?
//y luego en el modelo de usuario meter una clave que sea loginMethod y diga google o normal, para que en el login
//te diga si tienes que hacer login con google o normal


module.exports = registerGoogle;





//<-- SEC              SENDCODE DEL REDIRECT DE SENDMAIL!!!                    -->
const sendCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDB = await User.findById(id);

    const emailEnv = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailEnv,
        pass: password,
      },
    });

    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: "Confirmation code",
      text: `Your code is ${userDB.confirmationCode}. Thank you for using our service.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json({
          user: userDB,
          info: "Error, please resend.",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          user: userDB,
          confirmationCode: userDB.confirmationCode,
        });
      }
    });
  } catch (error) {
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};

//<!--SEC                                         isVerified EMAIL                                                   ->
//WORKS CORRECTLY

const newUserCheck = async (req, res, next) => {
  try {
    const { email, confirmationCode } = req.body;
    const doesUserExist = await User.findOne({ email });
    console.log(confirmationCode);
    console.log(doesUserExist.confirmationCode);
    if (!doesUserExist) {
      return res.status(404).json("User not found.");
    } else {
      if (doesUserExist.confirmationCode == confirmationCode) {
        //? No me deja poner un estrictamente igual
        try {
          console.log("Codigo ok");

          await doesUserExist.updateOne({ isVerified: true });
          const updatedUser = await User.findOne({ email });
          return res.status(200).json({
            testUser: updatedUser.isVerified == true ? true : false,
          });
        } catch (error) {
          return res.status(404).json("Error in updating validation.");
        }
      } else {
        console.log("Borrado");
        await User.findByIdAndDelete(doesUserExist._id);
        deleteImgCloudinary(doesUserExist.image);
        return res.status(404).json({
          doesUserExist,
          isVerified: false,
          delete: (await User.findById(doesUserExist._id))
            ? "Error deleting user."
            : "User deleted for security. Please register again.",
        });
      }
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

//<!--SEC                                         RESEND EMAIL                                                   ->
//WORKS CORRECTLY

const resendCode = async (req, res, next) => {
  //ESTA ES LA UNICA QUE ES ASINCRONA DE MANDAR UN CODIGO
  console.log(req.body);
  try {
    console.log("Entro en el try");
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });
    const doesUserExist = await User.findOne({ email: req.body.email });
    if (doesUserExist) {
      const mailOptions = {
        from: email,
        to: req.body.email,
        subject: "Confirmation code",
        text: `Hi! Your confirmation code is ${doesUserExist.confirmationCode}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(200).json({ resendDone: false });
        } else {
          console.log(`Email sent to ${req.body.email}, ${info.response}`);
          return res.status(200).json({ resendDone: true });
        }
      });
    } else {
      return res.status(404).json("User does not exist.");
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

//<!--SEC                                             LOGIN                                                     ->
//WORKS CORRECTLY

const userLogin = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const userFromDB = await User.findOne({ email });
    
    if (userFromDB) {
      if (userFromDB.googleSignUp == true) {
        return res.status(404).json('Sign in with Google.')
      }
      if (bcrypt.compareSync(password, userFromDB.password)) {
        const token = generateToken(userFromDB._id, email); //token
        return res.status(200).json({
          user: userFromDB,
          token: token,
          state: "You are logged in.",
        });
      } else {
        return res.status(404).json("Password is incorrect."); //no concuerdan
      }
    } else {
      return res.status(404).json("User not found.");
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

//<!--SEC                                           AUTO  LOGIN                                                  ->

const autoLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const userFromDB = await User.findOne({ email });
    if (userFromDB) {
      if (password === userFromDB.password) {
        const token = generateToken(userFromDB._id, email);
        return res.status(200).json({ user: userFromDB, token: token });
      } else {
        return res
          .status(404)
          .json("Password does not match. Please try again.");
      }
    } else {
      return res.status(404).json("User does not exist.");
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

//<!--SEC                                  PASSWORD CHANGE WHILE LOGGED OUT                                   ->
//WORKS CORRECTLY

const passChangeWhileLoggedOut = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    const userFromDB = await User.findOne({ email });
    if (userFromDB) {
      if (userFromDB.googleSignUp == true) {
        return res.status(404).json('Sign in with Google.')}
      console.log("userFromDB antes del redirect:", userFromDB._id);
      return res.redirect(
        307,
        `http://localhost:8081/api/v1/users/sendPassword/${userFromDB._id}`
      );
    } else {
      return res.status(404).json("User does not exist.");
    }
  } catch (error) {
    return next(
      setError(500, {
        message: error.message,
        error: "Error in password change catch while logged out.",
      })
    );
  }
};
//!REDIRECT DE SEND PASSWORD DE LA ANTERIOR!!
const sendPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log({ id });
    const userById = await User.findById(id);
    const newPassword = randomPassword();
    console.log(newPassword);

    const envEmail = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: envEmail,
        pass: password,
      },
    });

    const mailOptions = {
      from: envEmail,
      to: userById.email,
      subject: `Hi, ${userById.name}`,
      text: `Hi, here is your temporary password. Please change it immediately after login. ${newPassword}`,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        return res.status(404).json({
          message: error,
          error: "Mail not sent and password not changed. Please try again.",
        });
      } else {
        const newHashedPassword = bcrypt.hashSync(newPassword, 10);
        try {
          await User.findByIdAndUpdate(id, { password: newHashedPassword });
          const updatedUser = await User.findById(id);
          console.log(newHashedPassword);
          console.log(updatedUser.password);

          if (bcrypt.compareSync(newPassword, updatedUser.password)) {
            return res.status(200).json({
              message: "Mail sent and user updated successfully.",
              info,
            });
          } else {
            return res.status(404).json({
              message:
                "Mail sent but password not changed. Please send the password again.",
            });
          }
        } catch (error) {
          return res.status(404).json("Error in password update");
        }
      }
    });
  } catch (error) {
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};

//<!--SEC                                             WITH AUTH                                                     ->
//<!--SEC                                             WITH AUTH                                                     ->
//<!--SEC                                             WITH AUTH                                                     ->

//<!--SEC                                           PASSWORD CHANGE                                              ->
//WORKS CORRECTLY
//fix password change que no funcione para loos usuarios de google
//if (userFromDB.googleSignUp == true) {return res.status(404).json('Sign in with Google.')}
const passwordChange = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const isValidPassword = validator.isStrongPassword(newPassword);

    if (isValidPassword) {
      const { _id } = req.user;
      if (bcrypt.compareSync(password, req.user.password)) {
        const newHashedPassword = bcrypt.hashSync(newPassword, 10);
        try {
          await User.findByIdAndUpdate(_id, {
            password: newHashedPassword,
          });
          const updatedUser = await User.findById(_id);
          if (bcrypt.compareSync(newPassword, updatedUser.password)) {
            return res.status(200).json("Password updated succesfully.");
          } else {
            return res.status(404).json("Password not updated.");
          }
        } catch (error) {
          return res.status(404).json({
            error: "Error updating password.",
            message: error.message,
          });
        }
      } else {
        return res
          .status(404)
          .json("Password is not correct. Please input your password.");
      }
    } else {
      return res
        .status(404)
        .json(
          "Password needs one special character, 8 minimum letters, one in uppercase and at least a number."
        );
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

//<!--SEC                                          UPDATE USER                                                   ->

const updateUser = async (req, res, next) => {
  let catchImage = req.file?.path;
  try {
    await User.syncIndexes();
    const patchedUser = new User(req.body);
    req.file && (patchedUser.image = catchImage);

    patchedUser._id = req.user._id;
    patchedUser.password = req.user.password;
    patchedUser.role = req.user.role;
    patchedUser.confirmationCode = req.user.confirmationCode;
    patchedUser.email = req.user.email;
    patchedUser.isVerified = req.user.isVerified;
    patchedUser.googleSignUp = req.user.googleSignUp;
    patchedUser.gender = req.user.gender;
    patchedUser.username = req.user.username;
    patchedUser.birthYear = req.user.birthYear;
    patchedUser.name = req.body?.name ? req.body.name : req.user.name;
    patchedUser.lastName = req.body?.lastName
      ? req.body.lastName
      : req.user.lastName;
    patchedUser.description = req.body?.description
      ? req.body.description
      : req.user.description;
    patchedUser.sentComments = req.user.sentComments;
    patchedUser.receivedComments = req.user.receivedComments;
    patchedUser.likedComments = req.user.likedComments;
    patchedUser.savedRooms = req.user.savedRooms;
    patchedUser.myPosts = req.user.myPosts;
    patchedUser.likedPosts = req.user.likedPosts;

    if (req.body?.interests) {
      const enumResult = enumCheck(req.body?.gender);
      patchedUser.interests = enumResult.check
        ? req.body?.interests
        : req.user.interests;
    }

    try {
      await User.findByIdAndUpdate(req.user._id, patchedUser);
      req.file && deleteImgCloudinary(req.user.userEmail);

      //------testing---------
      const updatedUser = await User.findById(req.user._id);
      const updatedKeys = Object.keys(req.body);
      const testingUpdate = [];

      updatedKeys.forEach((item) => {
        if (updatedUser[item] === req.body[item]) {
          if (updatedUser[item] != req.user[item]) {
            testingUpdate.push({ [item]: true });
          } else {
            testingUpdate.push({ [item]: "Information is the same." });
          }
        } else {
          testingUpdate.push({ [item]: false });
        }

        if (req.file) {
          updatedUser.image === catchImage
            ? testingUpdate.push({ image: true })
            : testingUpdate.push({ image: false });
        }
        return res.status(200).json({ updatedUser, testingUpdate });
      });
    } catch (error) {
      return res
        .status(404)
        .json({ error: "Error in updating the user", message: error.message });
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};

//<!--SEC                                        DELETE USER                                                     ->

const deleteUser = async (req, res, next) => {
  if (req.user.googleSignUp == false) {
    try {
    console.log(req?.user?.password, "password");
    const _id = req?.user?._id;
    // I could also grab the pass and email through the req.user but I thought it safer this way.
    const dataBaseUser = await User.findById(_id);
    if (bcrypt.compareSync(req.body.password, req.user.password)) {
      //le he puesto para que meta su contrasena antes de borrar su usuario :)
      try {
        await User.findByIdAndDelete(req.user?._id);
        deleteImgCloudinary(dataBaseUser.image);
        try {
          try {
            await Comments.deleteMany({ creator: _id });
            try {
              await Comment.updateMany(
                { likes: _id },
                { $pull: { likes: _id } }
              );
              try {
                await Room.updateMany(
                  { likes: _id },
                  { $pull: { likes: _id } }
                );
                try {
                  await Room.deleteMany({ postedBy: _id });
                  try {
                    await Post.deleteMany({ author: _id });
                    try {
                      await Post.updateMany(
                        { likes: _id },
                        { $pull: { likes: _id } }
                      );
                      try {
                      } catch (error) {
                        return res.status(404).json("Error pulling references");
                      }
                    } catch (error) {
                      return res
                        .status(404)
                        .json("Error updating likes in posts.");
                    }
                  } catch (error) {
                    return res.status(404).json("Error deleting posts");
                  }
                } catch (error) {
                  return res
                    .status(404)
                    .json("Error deleting room announcements.");
                }
              } catch (error) {
                return res.status(404).json("Error pulling rooms likes.");
              }
            } catch (error) {
              return res.status(404).json("Error pulling comments likes.");
            }
          } catch (error) {
            return res.status(404).json("Error deleting comments.");
          }
        } catch (error) {
          return res
            .status(404)
            .json("Error updating references to other models.");
        }
        const doesUserExist = await User.findById(req.user._id);
        console.log(doesUserExist);
        return res
          .status(doesUserExist ? 404 : 200)
          .json(
            doesUserExist
              ? "User not deleted. Please try again."
              : "User deleted successfully."
          );
      } catch (error) {
        return res.status(500).json("Error in delete catch");
      }
    } else {
      return res
        .status(404)
        .json("Error in input fields, please check spelling and try again.");
    }
  } catch (error) {
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
  } else {
    try {
      await User.findByIdAndDelete(req.user?._id);
      deleteImgCloudinary(dataBaseUser.image);
      try {
        try {
          await Comments.deleteMany({ creator: _id });
          try {
            await Comment.updateMany(
              { likes: _id },
              { $pull: { likes: _id } }
            );
            try {
              await Room.updateMany(
                { likes: _id },
                { $pull: { likes: _id } }
              );
              try {
                await Room.deleteMAny({ postedBy: _id });
                try {
                  await Post.deleteMany({ author: _id });
                  try {
                    await Post.updateMany(
                      { likes: _id },
                      { $pull: { likes: _id } }
                    );
                    try {
                    } catch (error) {
                      return res.status(404).json("Error pulling references");
                    }
                  } catch (error) {
                    return res
                      .status(404)
                      .json("Error updating likes in posts.");
                  }
                } catch (error) {
                  return res.status(404).json("Error deleting posts");
                }
              } catch (error) {
                return res
                  .status(404)
                  .json("Error deleting room announcements.");
              }
            } catch (error) {
              return res.status(404).json("Error pulling rooms likes.");
            }
          } catch (error) {
            return res.status(404).json("Error pulling comments likes.");
          }
        } catch (error) {
          return res.status(404).json("Error deleting comments.");
        }
      } catch (error) {
        return res
          .status(404)
          .json("Error updating references to other models.");
      }
      const doesUserExist = await User.findById(req.user._id);
      console.log(doesUserExist);
      return res
        .status(doesUserExist ? 404 : 200)
        .json(
          doesUserExist
            ? "User not deleted. Please try again."
            : "User deleted successfully."
        );
    } catch (error) {
      return res.status(500).json("Error in delete catch");
    }
  }
};

//<!--SEC                                        GET ALL                                                     ->
//WORKS CORRECTLY

const getAll = async (req, res, next) => {
  try {
    const allUsers = await User.find();
    if (allUsers.length > 0) {
      return res.status(200).json(allUsers);
    } else {
      return res.status(404).json("No users in the database.");
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

//<!--SEC                                        GET BY ID                                                     ->
//WORKS CORRECTLY
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json("That user doesn't exist.");
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

//<!--SEC                                        GET BY ID                                                     ->
//WORKS CORRECTLY
const getUserByIdPopulated = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id).populate(
      "sentComments receivedComments likedComments savedRooms myPosts myRooms likedPosts"
    );
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json("That user doesn't exist.");
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

//<!--SEC                                        GET BY NAME                                                     ->
//WORKS CORRECTLY

const getByName = async (req, res, next) => {
  //es para name y para userName!!
  try {
    console.log(req.body);
    let { name } = req.body;

    console.log(name);
    const UsersByName = await User.find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { username: { $regex: name, $options: "i" } },
      ],
    });
    console.log(UsersByName);
    if (UsersByName.length > 0) {
      return res.status(200).json(UsersByName);
    } else {
      return res
        .status(404)
        .json("That username doesn't show up in our database.");
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

//<!--SEC                                        GET BY AGE                                                     ->
const getByAge = async (req, res, next) => {
  try {
    let { age } = req.body;
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear - parseInt(age);
    let range;
    let filter;
    if (req.body?.range) {
      range = req.body.range;
      range = parseInt(range);
      console.log(range);
    } else {
      range = 2;
    }
    if (req.body?.filter) {
      filter = req.body.filter === "des" ? -1 : 1; //I could set a switch but in pos of a selector that only lets you have two values, i wont
    }
    let baseYear = parseInt(targetYear);
    let younger = baseYear + range;
    let older = baseYear - range;
    console.log(older, baseYear, younger);
    try {
      const userResults = await User.find({
        $and: [
          { birthYear: { $gte: older } },
          { birthYear: { $lte: younger } },
        ],
      }).sort({ birthYear: filter });
      if (userResults.length > 0) {
        return res.status(200).json(userResults);
      } else {
        return res.status(404).json("Couldn't find any users with that age.");
      }
    } catch (error) {
      return res.status(404).json("Error finding users catch.");
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

//<!--SEC                                        TOGGLE LIKE                                                     ->
const toggleLikedPost = async (req, res, next) => {
  try {
    console.log("body y user", req.body, req.user);
    const { id } = req.params;
    const { _id, likedPosts } = req.user;
    if (likedPosts.includes(id)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedPosts: id },
        });
        try {
          await Post.findByIdAndUpdate(id, {
            $pull: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            postUnfavorited: await Post.findById(id),
          });
        } catch (error) {
          return res.status(404).json("Error in pulling user from likes.");
        }
      } catch (error) {
        return res.status(404).json("Error in pulling post from LikedPosts.");
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedPosts: id },
        });
        try {
          await Post.findByIdAndUpdate(id, {
            $push: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            addedLikedPosts: await Post.findById(id),
          });
        } catch (error) {
          return res.status(404).json({
            error: error.message,
            message: "Error in pushing our id to likes in post.",
          });
        }
      } catch (error) {
        return res.status(404).json("Error in pushing post to likedPosts.");
      }
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

//<!--SEC                                        TOGGLE LIKED COMMENTS                                                     ->
const toggleLikedComment = async (req, res, next) => {
  try {
    console.log("body y user", req.body, req.user);
    const { id } = req.params;
    const { _id, likedComments } = req.user;
    if (likedComments.includes(id)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedComments: id },
        });
        try {
          await Comment.findByIdAndUpdate(id, {
            $pull: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            commentUnfavorited: await Comment.findById(id),
          });
        } catch (error) {
          return res.status(404).json("Error in pulling user from likes.");
        }
      } catch (error) {
        return res
          .status(404)
          .json("Error in pulling comment from likedComments.");
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedComments: id },
        });
        try {
          await Comment.findByIdAndUpdate(id, {
            $push: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            addedLikedComment: await Comment.findById(id),
          });
        } catch (error) {
          return res.status(404).json({
            error: error.message,
            message: "Error in pushing our id to likes in comment.",
          });
        }
      } catch (error) {
        return res.status(404).json("Error in pushing post to likedComments.");
      }
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

//<!--SEC                                        TOGGLE SAVED ROOM                                                     ->
const saveRoom = async (req, res, next) => {
  try {
    console.log("body y user", req.body, req.user);
    const { id } = req.params;
    const { _id, savedRooms } = req.user;
    if (savedRooms.includes(id)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { savedRooms: id },
        });
        try {
          await Room.findByIdAndUpdate(id, {
            $pull: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            roomUnfavorited: await Room.findById(id),
          });
        } catch (error) {
          return res.status(404).json("Error in pulling user from likes.");
        }
      } catch (error) {
        return res.status(404).json("Error in pulling room from likedRooms.");
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { savedRooms: id },
        });
        try {
          await Post.findByIdAndUpdate(id, {
            $push: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            addedRoom: await Room.findById(id),
          });
        } catch (error) {
          return res.status(404).json({
            error: error.message,
            message: "Error in pushing our id to likes in room.",
          });
        }
      } catch (error) {
        return res.status(404).json("Error in pushing room to savedRooms.");
      }
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
//<!--SEC                                        DELETE USER                                                     ->

module.exports = {
  redirectRegister,
  sendCode,
  resendCode,
  newUserCheck,
  autoLogin,
  userLogin,
  passwordChange,
  sendPassword,
  passChangeWhileLoggedOut,
  updateUser,
  deleteUser,
  getAll,
  getUserById,
  getUserByIdPopulated,
  getByName,
  getByAge,
  toggleLikedComment,
  toggleLikedPost,
  saveRoom,
  registerGoogle
};
