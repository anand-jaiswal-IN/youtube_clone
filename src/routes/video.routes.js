import express from 'express';
const router = express.Router();
import { uploadNewVideo, getVideo } from '../controllers/video.controller.js';
import upload from '../middlewares/multer.middleware.js';
import verifyJWT from '../middlewares/auth.middleware.js';

router.use(verifyJWT);
router.route('/upload-video').post(upload.single('videoFile'), uploadNewVideo);
router.route('/:videoID').get(getVideo);

export default router;
