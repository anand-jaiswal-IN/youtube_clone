import { Router } from 'express';
import upload from '../middlewares/multer.middleware..js'
import verifyJWT from '../middlewares/auth.middleware.js';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(verifyJWT, logoutUser);

export default router;
