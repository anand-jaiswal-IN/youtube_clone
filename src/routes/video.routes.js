import express from 'express';
const router = express.Router();
import {
  uploadNewVideo,
  getVideo,
  togglePublish,
  updateVideoThumbnail,
  getAllChannelVideos,
} from '../controllers/video.controller.js';
import upload from '../middlewares/multer.middleware.js';
import verifyJWT from '../middlewares/auth.middleware.js';
import hasOwnChannel from '../middlewares/haveOwnChannel.middleware.js';

router.use(verifyJWT);

router.route('/v/:videoID').get(getVideo);


router.use(hasOwnChannel);

router.route('/all-videos').get(getAllChannelVideos);
router.route('/upload-video').post(
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  uploadNewVideo
);
router.route('/togglePublish/:videoID').get(togglePublish);

router
  .route('/changeThumbnail/:videoID')
  .post(upload.single('thumbnail'), updateVideoThumbnail);
export default router;
