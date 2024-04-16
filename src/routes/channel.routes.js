import express from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import { createChannel, getUserChannelProfile } from '../controllers/channel.controller.js';

const router = express.Router();

router.route("/:username").get(getUserChannelProfile)


//secured routes

router.use(verifyJWT);
router.route("/create").post(createChannel)


export default router;