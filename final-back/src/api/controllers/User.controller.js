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

//<!--SEC                                   LONG  REGISTRATION                                                   ->

const userRegistration = async (req, res, next) => {
  let catchImage = req.file?.path;
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { username, email } = req.body;

    const doesUserExist = await User.findOne(
      { username: req.body.username },
      { email: req.body.email }
    );
    if (!doesUserExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      req.file
        ? (newUser.image = req.file.path)
        : (newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png"); //puede que me de error
      try {
        const savedUser = await newUser.save();
        if (savedUser) {
          //si saved user existe... no tenemos un else porque si no existiese, lo recogeria ek try catch
          const EnvEmail = process.env.EMAIL;
          const PASSWORD = process.env.PASSWORD;
          console.log(email);

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: EnvEmail,
              pass: PASSWORD,
            },
          });

          const mailOptions = {
            from: EnvEmail,
            to: email,
            subject: "Confirmation Code",
            text: `Your code is ${confirmationCode}, thank you for trusting us ${username}`,
          };
          console.log(email, "Antes de .sendmail");
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: savedUser,
                confirmationCode: "Error, resend the confirmation code",
              });
            } else {
              console.log(`Email sent to ${email} ` + info.response);
              return res.status(200).json({
                user: savedUser,
                confirmationCode,
              });
            }
          });
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImage);
        res
          .status(404)
          .json({ error: "Error in the save", message: error.message });
      }
    } else {
      req.file && deleteImgCloudinary(catchImage); //puede que me de error
      res.status(409).json("User already in database");
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    return (
      res
        .status(404)
        .json({ error: "General catch error", message: error.message }) &&
      next(error)
    );
  }
};

//<!--SEC                                   STATE  REGISTRATION                                                  ->

const stateRegister = async (req, res, next) => {
  let catchImage = req.file?.path;

  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { email, username } = req.body;

    const doesUserExist = await User.findOne(
      { email: req.body.email },
      { username: req.body.username }
    );

    if (!doesUserExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const savedUser = await newUser.save();

        if (savedUser) {
          //aqui no hay else porque si no lo encuentra es porque no se ha guardado, y saltara en el try catch
          sendEmail(email, username, confirmationCode); //PRIMERO enviamos el email

          setTimeout(() => {
            //dejamos esperar un poco hasta que  send email gestione sus asincronias, y luego checkeamos el estado de getSentEmail
            console.log(getSentEmail());
            if (getSentEmail()) {
              setSentEmail(false);
              res.status(200).json({ user: savedUser, confirmationCode });
            } else {
              setSentEmail(false);
              return res.status(404).json({
                user: savedUser,
                confirmationCode: "Error. Please resend confirmation code.",
              });
            }
          }, 2000);
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImage);
        return res.status(404).json({
          error: "Error saving the User through states",
          message: error.message,
        });
      }
    } else {
      //si no ponemos las llaves seria un else if jajaj
      req.file && deleteImgCloudinary(catchImage); //!PUEDE DAR ERROR??
      return res.status(409).json(`The user is already in our database.`);
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    return (
      res.status(404).json({
        error: "Error in registration catch",
        message: error.message,
      }) && next(error)
    );
  }
};

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
      console.log("hola, funciono");
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }
      try {
        const savedUser = await newUser.save();
        if (savedUser) {
          return res.redirect(
            307,
            `http://localhost:8088/api/v1/users/register/sendMail/${savedUser._id}`
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
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    })&& next(error)
  }
};

//!--------SENDCODE DEL REDIRECT DE SENDMAIL!!!
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
