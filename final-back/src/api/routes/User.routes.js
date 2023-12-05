
const { isAuth, isAuthAdmin } = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/files.middleware'); //? lo traemos porque hay una subida de ficheros


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
  } = require('../controllers/User.controller');
  

  //!--------ROUTES----------------------------------------------
  
  const UserRoutes = require('express').Router();
  
  UserRoutes.post(
    '/register/registerRedirect',
    upload.single('image'),
    redirectRegister
  );
  UserRoutes.post('/login', userLogin);
  UserRoutes.post('/login/autologin', autoLogin);
  UserRoutes.post('/resend/code', resendCode);
  UserRoutes.post('/check', newUserCheck);
  UserRoutes.patch(
    '/changeUserPassword/changeUserPassword',
    passChangeWhileLoggedOut
  );
  
  //!---------AUTH-----------------
  UserRoutes.patch('/changePassword', [isAuthorized], passwordChange);
  UserRoutes.patch(
    '/update/update',
    [isAuthorized],
    upload.single('image'),
    updateUser
  );

  //!-------REDIRECTS--------------------------------------------
  
  UserRoutes.post('/register/sendMail/:id', sendCode);
  UserRoutes.patch('/sendPassword/:id', sendPassword);


module.exports = UserRoutes;
