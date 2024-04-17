import mongoose from 'mongoose';
import User from '../models/user.models.js';
import Channel from '../models/channel.models.js';
import Subscription from '../models/subscription.models.js';
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
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: '_id',
        foreignField: 'owner',
        as: 'videos',
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: '$subscribers',
        },

        videosCount: { $size: '$videos' },

        isSubscribed: {
          // subscribers = [{subcriber : user1}, {subcriber : user2}, {subcriber : user3}]
          $cond: {
            if: {
              $in: [req.user?._id, '$subscribers.subscriber'],
            },
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
        owner: 1,
        videos: 1,
      },
    },
  ]);
  if (!(channel.length > 0)) {
    throw new ApiError(404, "Channel doesn't exists");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], 'User channel fetched successfully')
    );
});
const subscribeToChannel = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(400, 'User does not exists');
  }
  const channel = await Channel.findById(req.params.channelID);
  if (!channel) {
    throw new ApiError(400, 'Channel does not exists');
  }
  if (
    await Subscription.findOne({
      $and: [{ subscriber: user._id }, { channel: channel._id }],
    })
  ) {
    throw new ApiError(400, 'Already subscribed to this channel');
  }
  await Subscription.create({
    subscriber: user._id,
    channel: channel._id,
  });
  res
    .status(200)
    .json(new ApiResponse(200, channel, 'Channel subscribed successfully'));
});
const getChannelVideos = asyncHandler(async (req, res) => {
  const channel = await Channel.findOne({ owner: req.user?._id });

  if (!channel) {
    throw new ApiError(400, 'Channel does not exits');
  }
  const channelVideos = await Channel.aggregate([
    {
      $match: { _id: new mongoose.Schema.ObjectId(channel._id) },
    },
    {
      $lookup: {
        from: 'videos',
        localfield: '_id',
        foreignField: 'owner',
        as: 'videos',
      },
    },
    {
      $addFields: {
        videosCount: { $size: '$videos' },
      },
    },
    {
      $project: {
        name: 1,
        videoCount: 1,
        videos: 1,
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, 'Channel Videos Fetched Successfully')
    );
});
export {
  createChannel,
  getUserChannelProfile,
  subscribeToChannel,
  // getChannelVideos,
};
