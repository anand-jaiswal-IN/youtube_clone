import { Router } from 'express';
import upload from '../middlewares/multer.middleware.js';
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
  getUserProfile,
  sendOTPtoVerify,
  verifyUserByOTP,
  getUserWatchHistory
} from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes

router.route('/refresh-token').get(refreshAccessToken);

router.use(verifyJWT);
router.route('/send-OTP-to-verify').get(sendOTPtoVerify);
router.route('/verify-your-email').post(verifyUserByOTP);
router.route('/logout').get(logoutUser);
router.route('/profile/my-profile').get(getUserProfile);
router.route('/update/details').post(updateUserDetail);
router.route('/update/username').post(updateUsername);
router.route('/update/password').post(updatePassword);
router.route('/update/avatar').post(upload.single('avatar'), updateAvatar);
router.route('/your-watch-history').get(getUserWatchHistory)
export default router;
