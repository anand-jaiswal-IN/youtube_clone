import { Router } from 'express';
import upload from '../middlewares/multer.middleware..js';
import verifyJWT from '../middlewares/auth.middleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserDetail,
  updateUsername,
  updatePassword,
  updateAvatar,
} from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes

// router.use(verifyJWT);
router.route('/logout').get(verifyJWT, logoutUser);
router.route('/refresh-token').get(refreshAccessToken);

router.route('/update/details').post(verifyJWT, updateUserDetail);
router.route('/update/username').post(verifyJWT, updateUsername);
router.route('/update/password').post(verifyJWT, updatePassword);
router
  .route('/update/avatar')
  .post(verifyJWT, upload.single('avatar'), updateAvatar);
export default router;
