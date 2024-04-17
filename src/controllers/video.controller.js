import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/category.models.js';
import Video from '../models/video.models.js';
import uploadFile from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/user.models.js';

const uploadNewVideo = asyncHandler(async (req, res) => {
  let { title, description, category } = req.body;
  let videoFile = req.file;
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
  videoFile = await uploadFile(videoFile?.path);

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
  });
  res
    .status(201)
    .json(new ApiResponse(201, video, 'Video uploaded successfully'));
});
const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoID);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  await Video.findByIdAndUpdate(
    video._id,
    { $push: { views: await User.findById(req?.user?._id) } },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, video, 'Video Found'));
});
export { uploadNewVideo, getVideo };
