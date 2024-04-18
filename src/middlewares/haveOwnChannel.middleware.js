import Channel from "../models/channel.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const hasOwnChannel = asyncHandler(async (req, res, next) => {
    const channel = await Channel.findOne({ owner: req.user?._id });
    if (!channel) {
        throw new ApiError(400, 'You have not your own channel');
    }
    next();
})
export default hasOwnChannel;