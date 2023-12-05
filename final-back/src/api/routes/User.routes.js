const { isAuth,   } = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/files.middleware'); //? lo traemos porque hay una subida de ficheros


const {
    userRegistration,
    stateRegister,
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
    toggleFollow,
    toggleFavSong,
    toggleFavAlbum,
    getBySwitch,
    sortSwitch,
    getUserById,
    getUserByIdLikedAlbums,
    toggleFavAlbumIndiv,
    getUserByIdPopulatedLikedAlbums,
  } = require('../controllers/User.controller');
  
  //!--------ROUTES----------------------------------------------
  
  const UserRoutes = require('express').Router();
  
  UserRoutes.post('/register', upload.single('image'), userRegistration);
  UserRoutes.post('/registerState', upload.single('image'), stateRegister);
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
  UserRoutes.get('/userByIdLikes', [isAuthorized], getUserByIdLikedAlbums);
  UserRoutes.get(
    '/populatedAlbums',
    [isAuthorized],
    getUserByIdPopulatedLikedAlbums
  );
  UserRoutes.get('/userById', [isAuthorized], getUserById);
  UserRoutes.delete('/delete', [isAuthorized], deleteUser);
  UserRoutes.patch('/follow/:id', [isAuthorized], toggleFollow);
  UserRoutes.patch('/favSong/:id', [isAuthorized], toggleFavSong);
  UserRoutes.patch('/favAlbum/:id', [isAuthorized], toggleFavAlbumIndiv);
  UserRoutes.patch('/setFavAlbum', [isAuthorized], toggleFavAlbum); //este lo pilla por el body
  UserRoutes.get('/', [isAuthorized], getBySwitch);
  UserRoutes.get('/sort', [isAuthorized], sortSwitch);
  
  //!-------REDIRECTS--------------------------------------------
  
  UserRoutes.post('/register/sendMail/:id', sendCode);
  UserRoutes.patch('/sendPassword/:id', sendPassword);


module.exports = UserRoutes;
