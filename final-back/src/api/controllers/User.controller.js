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

//<!--SEC                                   REDIRECT  REGISTRATION                                                   ->

const redirectRegister = async (req, res, next) => {
  let catchImage = req.file?.path;
  console.log(catchImage);
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
      text: `Your code is ${confirmationCode}. Thank you for using our service.`,
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
const userLogin = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const userFromDB = await User.findOne({ email });

    if (userFromDB) {
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

const passChangeWhileLoggedOut = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    const userFromDB = await User.findOne({ email });
    if (userFromDB) {
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

// const updateUser = async (req, res, next) => {
//   let catchImage = req.file?.path;
//   try {
//     await User.syncIndexes();
//     const patchedUser = new User(req.body);
//     req.file && (patchedUser.image = catchImage);

//     patchedUser._id = req.user._id;
//     patchedUser.password = req.user.password;
//     patchedUser.role = req.user.role;
//     patchedUser.confirmationEmailCode = req.user.confirmationEmailCode;
//     patchedUser.userEmail = req.user.userEmail;
//     patchedUser.isVerified = req.user.isVerified;
//     patchedUser.favAlbums = req.user.favAlbums;
//     patchedUser.favSongs = req.user.favSongs;
//     patchedUser.followers = req.user.followers;
//     patchedUser.following = req.user.following;
//     patchedUser.gender = req.user.gender;

//     // if (req.body?.gender) {
//     //   const enumResult = enumOk(req.body?.gender);
//     //   patchedUser.gender = enumResult.check
//     //     ? req.body?.gender
//     //     : req.user.gender;
//     // }

//     try {
//       await User.findByIdAndUpdate(req.user._id, patchedUser);
//       req.file && deleteImgCloudinary(req.user.userEmail);

//       //------testing---------
//       const updatedUser = await User.findById(req.user._id);
//       const updatedKeys = Object.keys(req.body);
//       const testingUpdate = [];

//       updatedKeys.forEach((item) => {
//         if (updatedUser[item] === req.body[item]) {
//           if (updatedUser[item] != req.user[item]) {
//             testingUpdate.push({ [item]: true });
//           } else {
//             testingUpdate.push({ [item]: "Information is the same." });
//           }
//         } else {
//           testingUpdate.push({ [item]: false });
//         }

//         if (req.file) {
//           updatedUser.image === catchImage
//             ? testingUpdate.push({ image: true })
//             : testingUpdate.push({ image: false });
//         }
//         return res.status(200).json({ updatedUser, testingUpdate });
//       });
//     } catch (error) {
//       return res
//         .status(404)
//         .json({ error: "Error in updating the user", message: error.message });
//     }
//   } catch (error) {
//     req.file && deleteImgCloudinary(catchImage);
//     return next(
//       setError(500, error.message || "Error in update general catch.")
//     );
//   }
// };

// //<!--SEC                                        DELETE USER                                                     ->

// const deleteUser = async (req, res) => {
//   try {
//     console.log(req?.user?.password, "passsssss");
//     const _id = req?.user?._id;
//     // I could also grab the pass and email through the req.user but I thought it safer this way.
//     const dataBaseUser = await User.findById(_id);
//     if (bcrypt.compareSync(req.body.password, req.user.password)) {
//       try {
//         await User.findByIdAndDelete(req.user?._id);
//         deleteImgCloudinary(dataBaseUser.image);
//         try {
//           try {
//             await Song.updateMany(
//               { likedBy: _id },
//               { $pull: { likedBy: _id } }
//             );
//             try {
//               await Album.updateMany(
//                 { likedBy: _id },
//                 { $pull: { likedBy: _id } }
//               );
//               try {
//                 await User.updateMany(
//                   { following: _id },
//                   { $pull: { following: _id } }
//                 );
//                 try {
//                   await User.updateMany(
//                     { followers: _id },
//                     { $pull: { followers: _id } }
//                   );
//                 } catch (error) {
//                   return res.status(404).json("Error pulling followers.");
//                 }
//               } catch (error) {
//                 return res.status(404).json("Error pulling following.");
//               }
//             } catch (error) {
//               return res.status(404).json("Error pulling albums.");
//             }
//           } catch (error) {
//             return res.status(404).json("Error pulling songs");
//           }
//         } catch (error) {
//           return res
//             .status(404)
//             .json("Error updating references to other models.");
//         }
//         const doesUserExist = await User.findById(req.user._id);
//         console.log(doesUserExist);
//         return res
//           .status(doesUserExist ? 404 : 200)
//           .json(
//             doesUserExist
//               ? "User not deleted. Please try again."
//               : "User deleted successfully."
//           );
//       } catch (error) {
//         return res.status(500).json("Error in delete catch");
//       }
//     } else {
//       return res
//         .status(404)
//         .json("Error in input fields, please check spelling and try again.");
//     }
//   } catch (error) {
//     return res.status(404).json(error.message);
//   }
// };

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
  // updateUser,
  // deleteUser,
};
