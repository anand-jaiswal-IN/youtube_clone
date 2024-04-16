import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import {
  validateEmail,
  validatePassword,
  isValidName,
  isValidUsername,
} from '../utils/validation.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/user.models.js';
import uploadFile from '../utils/cloudinary.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while creating access and refresh token'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    throw new ApiError(400, 'Bad Request, Fields are required.');
  }
  const { username, email, password } = req.body;

  if (!validateEmail(email)) {
    throw new ApiError(400, 'Invalid Email');
  }
  if (!validatePassword(password)) {
    throw new ApiError(400, 'Invalid Password');
  }
  if (await User.findOne({ username })) {
    throw new ApiError(409, 'Username already in use, Try another one.');
  }
  if (await User.findOne({ $or: [{ email }, { username }] })) {
    throw new ApiError(
      409,
      'Email or Username already exists. Try with another email'
    );
  }

  let avatar = {};
  if (!req.file) {
    avatar.url = 'https://avatar.iran.liara.run/public/boy?username=user';
  } else {
    if (req.file.size > 100 * 1000) {
      throw new ApiError(400, 'Image size should be less than 1 MB');
    }
    // upload image to cloudinary
    avatar = await uploadFile(req.file?.path);
    if (!avatar) {
      throw new ApiError(500, 'Something went wrong while uploading avatar');
    }
  }

  // creating user in database
  const user = await User.create({
    username,
    email,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User created Successfully'));
});
const loginUser = asyncHandler(async (req, res) => {
  if (!req.body.usernameOrEmail || !req.body.password) {
    throw new ApiError(400, 'Bad Request, Fields are required.');
  }
  const { usernameOrEmail, password } = req.body;

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!user) {
    throw new ApiError(404, 'User does not exists');
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    })
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        'User Logged In Successfully'
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie('accessToken', { httpOnly: true, secure: true })
    .clearCookie('refreshToken', { httpOnly: true, secure: true })
    .json(new ApiResponse(200, {}, 'User Logged Out Successfully'));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Unauthorized request');
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, 'Invalid Refresh Token');
    }
    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie('accessToken', accessToken)
      .cookie('refreshToken', newRefreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access Token Refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Refresh Token');
  }
});
const updateUserDetail = asyncHandler(async (req, res) => {
  const { firstName, lastName, gender, bio } = req.body;
  if (!firstName || !lastName || !gender || !bio) {
    throw new ApiError(400, 'Bad Request. Fields are required');
  }
  if (!isValidName(firstName) || !isValidName(lastName)) {
    throw new ApiError(400, 'Firstname or Lastname is not valid');
  }
  if (!['M', 'F', 'O'].includes(gender)) {
    throw new ApiError(400, 'Gender is not Correct');
  }
  if (bio.length() < 6) {
    throw new ApiError(400, 'Bio is Too Short');
  }
  if (!bio.length() > 100) {
    throw new ApiError(400, 'Bio is Too Long');
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: [{ firstName, lastName, gender, bio }],
    },
    { new: true }
  ).select('-password -refreshToken');
  return res
    .status(202)
    .json(new ApiResponse(202, user, 'User updated successfully'));
});
const updateUsername = asyncHandler(async (req, res) => {
  const { newUsername, password } = req.body;
  if (!newUsername || !password) {
    throw new ApiError(400, 'Request with correct credentials');
  }

  if (!isValidUsername(newUsername)) {
    throw new ApiError(400, 'Username is NOT Valid');
  }

  let user = await User.findById(req?.user?._id);
  const isPasswordCorrect = user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Password is wrong');
  }

  user.username = newUsername;
  user = await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, user, 'Username updated Successfully'));
});
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if ((!oldPassword, !newPassword)) {
    throw new ApiError(400, 'Bad Request. Fields are required.');
  }
  let user = await User.findById(req?.user?._id);
  if (!user.isPasswordCorrect(oldPassword)) {
    throw new ApiError(401, 'Old password is wrong');
  }
  if (!validatePassword(newPassword)) {
    throw new ApiError(406, 'Invalid Password');
  }
  user.password = newPassword;
  user = await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, user, 'User password changed'));
});
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Bad Request. Field is required');
  }
  if (req.file.size > 100 * 1000) {
    // if file is more than 100kb
    throw new ApiError(
      400,
      'Avatar have exceed the file limit. Required less than 100kb'
    );
  }
  const avatar = await uploadFile(req.file?.path);
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: [{ avatar: avatar.url }] },
    { new: true }
  ).select('-password -refreshToken');
  res
    .status(200)
    .json(new ApiResponse(202, user, 'Avatar updated successfully'));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  username = username?.trim();
  if (!username) {
    new ApiError(400, 'username is missing');
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribedTo',
      },
    },
    {
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
        subscribedToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        bio: 1,
        gender: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImg: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if(!channel?.length){
    throw new ApiError(404, "Channel doesn't exists")
  }
  res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserDetail,
  updateUsername,
  updatePassword,
  updateAvatar,
};
