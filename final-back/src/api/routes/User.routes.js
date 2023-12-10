const { isAuth, isAuthAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
  redirectRegister,
  userLogin,
  resendCode,
  newUserCheck,
  passChangeWhileLoggedOut,
  autoLogin,
  sendCode,
  sendPassword,
  passwordChange,
  updateUser,
  deleteUser,
  getAll,
  getUserById,
  getByName,
  getByAge,
  toggleLikedPost,
  saveRoom,
  toggleLikedComment,
  getUserByIdPopulated,
  registerGoogle
} = require("../controllers/User.controller");

//!--------ROUTES----------------------------------------------

const UserRoutes = require("express").Router();

UserRoutes.post("/register/registerGoogle", registerGoogle);
UserRoutes.post("/register", redirectRegister)
UserRoutes.post("/login", userLogin);
UserRoutes.post("/login", userLogin);
UserRoutes.post("/login/autologin", autoLogin);
UserRoutes.post("/resend/code", resendCode);
UserRoutes.post("/check", newUserCheck);
UserRoutes.patch(
  "/changeUserPassword/changeUserPassword",
  passChangeWhileLoggedOut
);

//!---------AUTH-----------------
UserRoutes.patch("/changePassword", [isAuth], passwordChange);
UserRoutes.patch(
  "/update/update",
  [isAuth],
  upload.single("image"),
  updateUser
);
UserRoutes.delete("/deleteUser", [isAuth], deleteUser)
UserRoutes.get("/getAll", [isAuth], getAll)
UserRoutes.get("/getById/:id", [isAuth], getUserById)
UserRoutes.get("/getById/:id", [isAuth], getUserByIdPopulated)
UserRoutes.get("/byName/name", [isAuth], getByName)
UserRoutes.get("/byAge/age", [isAuth], getByAge)
UserRoutes.patch("/likeRoom/:id", [isAuth], toggleLikedComment)
UserRoutes.patch("/likePost/:id", [isAuth], toggleLikedPost)
UserRoutes.patch("/saveRoom/:id", [isAuth], saveRoom)




//!-------REDIRECTS--------------------------------------------

UserRoutes.post("/register/sendMail/:id", sendCode);
UserRoutes.patch("/sendPassword/:id", sendPassword);

module.exports = UserRoutes;

//hola
