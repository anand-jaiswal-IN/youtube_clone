import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/category.models.js';
import Video from '../models/video.models.js';
import uploadFile from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/user.models.js';
import Channel from '../models/channel.models.js';

const uploadNewVideo = asyncHandler(async (req, res) => {
  let { title, description, category } = req.body;
  let { videoFile, thumbnail } = req.files;
  category = JSON.parse(category);
  if (!title || !description || !category || !videoFile) {
    throw new ApiError(400, 'Bad Request, Fields are required');
  }

  if (title.trim() < 3 || title.trim() > 70) {
    throw new ApiError(400, 'Invalid Title');
  }
  if (description.trim() < 10 || description.trim() > 2000) {
    throw new ApiError(400, 'Invalid Description');
  }
  for (let i = 0; i < category.length; i++) {
    let c = await Category.findOne({ name: category[i] });
    if (!c) {
      throw new ApiError(400, 'Invalid Category');
    }
  }
  videoFile = await uploadFile(videoFile[0]?.path);
  if (thumbnail) {
    thumbnail = await uploadFile(thumbnail[0]?.path);
  }
  let catgs = [];

  for (let i = 0; i < category.length; i++) {
    let c = await Category.findOne({ name: category[i] });
    catgs.push(c._id);
  }
  const video = await Video.create({
    title,
    description,
    category: catgs,
    videoFile: videoFile.url,
    thumbnail: thumbnail?.url || '',
    isPublished: true,
    duration: videoFile.duration,
    owner: await Channel.findOne({ owner: req.user?._id }),
  });
  res
    .status(201)
    .json(new ApiResponse(201, video, 'Video uploaded successfully'));
});
const getVideo = asyncHandler(async (req, res) => {
  let video = await Video.findById(req.params.videoID);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(400, 'User does not exists');
  }

  if (!(await video.isVideoViewed(user))) {
    video = await Video.findByIdAndUpdate(
      video._id,
      { $push: { views: user._id } },
      { new: true }
    );
  }

  return res.status(200).json(new ApiResponse(200, video, 'Video Found'));
});
const getAllChannelVideos = asyncHandler(async (req, res) => {
  const channel = await Channel.findOne({
    owner: await User.findById(req?.user?._id),
  });
  if (!channel) {
    throw new ApiError(404, 'Channel not found');
  }
  const videos = await Video.find({ owner: channel});
  return res
    .status(200)
    .json(new ApiResponse(200, videos, 'All Channel Videos Found'));
});
const togglePublish = asyncHandler(async (req, res) => {
  let video = await Video.findById(req.params.videoID);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  if (!video.hasItsChannel(await Channel.findOne({ owner: req.user?._id }))) {
    throw new ApiError(400, 'You are not authorized to perform this action');
  }
  if (video.isPublished) {
    video.isPublished = false;
  } else {
    video.isPublished = true;
  }
  video = await video.save({ validateBeforeSave: false, new: true });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { _id: video._id, isPublished: video.isPublished },
        'Video status updated successfully'
      )
    );
});
const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoID);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  let thumbnail = req.file;
  if (!thumbnail) {
    throw new ApiError(400, 'Thumbnail is required');
  }
  thumbnail = await uploadFile(thumbnail.path);
  video.thumbnail = thumbnail.url;
  video = await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video Thumbnail updated successfully'));
});
export {
  uploadNewVideo,
  getVideo,
  togglePublish,
  updateVideoThumbnail,
  getAllChannelVideos,
};
