import express from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import { createChannel, getUserChannelProfile, subscribeToChannel } from '../controllers/channel.controller.js';

const router = express.Router();

//secured routes

// -> server/channel
router.use(verifyJWT);
router.route("/:username").get(getUserChannelProfile)
router.route("/create").post(createChannel)
router.route("/subscribe/:channelID").get(subscribeToChannel);

export default router;