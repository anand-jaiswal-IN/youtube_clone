import User from '../models/user.models.js';
import Channel from '../models/channel.models.js';
import Category from '../models/category.models.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const createChannel = asyncHandler(async (req, res) => {
  const { name, about, category } = req.body;
  if (!name || !about || !category) {
    throw new ApiError(400, 'Bad Request, Field are Required');
  }
  if (name?.trim().length < 4 || name?.trim().length > 30) {
    throw new ApiError(400, 'Name field is NOT valid');
  }
  if (about?.trim().length < 10 || about?.trim().length > 200) {
    throw new ApiError(400, 'About field is NOT valid');
  }
  if (category?.length > 3) {
    throw new ApiError(400, 'Category length exceeded for now');
  }
  for (let i = 0; i < category?.length; i++) {
    if (!(await Category.findOne({ name: category[i] }))) {
      throw new ApiError(400, 'Invalid Category found');
    }
  }
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(400, 'User does not exists');
  }
  const chh = await Channel.findOne({ owner: user._id });
  if (chh) {
    throw new ApiError(400, 'Channel already exists');
  }
  const databaseDefinedCategory = [];
  for (let i = 0; i < category.length; i++) {
    let c = await Category.findOne({ name: category[i] });
    databaseDefinedCategory.push(c);
  }
  const channel = await Channel.create({
    name,
    about,
    category: databaseDefinedCategory,
    owner: user,
  });
  res
    .status(201)
    .json(new ApiResponse(201, channel, 'Channel Created Successfully'));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  if (!req.path.username) {
    new ApiError(400, 'username is missing');
  }

  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    throw new ApiError(400, 'User does not exists');
  }
  const channel = await Channel.aggregate([
    {
      $match: { owner: user?._id },
    },
    {
      // subscribers - who is subscribing the channels
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribers',
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: '$subscribers',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
        videoCount: {
          $size: '$videos',
        },
      },
    },
    {
      $project: {
        name: 1,
        about: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        isSubscribed: 1,
        videoCount: 1,
      },
    },
  ]);
  if (!channel) {
    throw new ApiError(404, "Channel doesn't exists");
  }
  res.status(200).json(
    new ApiResponse(200, channel[0], 'User channel fetched successfully')
    // new ApiResponse(200, channel, 'User channel fetched successfully')
  );
});
export { createChannel, getUserChannelProfile };