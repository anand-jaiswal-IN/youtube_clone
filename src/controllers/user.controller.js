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

  // creating user in database
  const user = await User.create({
    username,
    email,
    password,
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
  console.log(req.body);
  const { firstName, lastName, gender, bio } = req.body;
  if (!firstName || !lastName || !gender || !bio) {
    throw new ApiError(400, 'Bad Request. Fields are required');
  }
  if (!isValidName(firstName) || !isValidName(lastName)) {
    throw new ApiError(400, 'Firstname or Lastname is not valid');
  }
  if (!['M', 'F', 'O'].includes(gender)) {
    throw new ApiError(400, 'Gender Field is not Valid');
  }
  if (bio?.trim().length < 11 || bio?.trim().length > 200) {
    throw new ApiError(400, 'Bio Field is not valid');
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { firstName, lastName, gender, bio },
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
    throw new ApiError(400, 'Bad Request. Wrong credentials');
  }

  if (!isValidUsername(newUsername)) {
    throw new ApiError(400, 'Username is NOT Valid');
  }

  let user = await User.findById(req?.user?._id);
  if (!(user.username != newUsername)) {
    throw new ApiError(400, 'Got Same Username');
  }
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
  if (!(await user.isPasswordCorrect(oldPassword))) {
    throw new ApiError(401, 'Old password is wrong');
  }
  if ((await user.isPasswordCorrect(newPassword))) {
    throw new ApiError(400, 'Got same old password');
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
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select('-password -refreshToken');
  res
    .status(200)
    .json(new ApiResponse(202, user, 'Avatar updated successfully'));
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
