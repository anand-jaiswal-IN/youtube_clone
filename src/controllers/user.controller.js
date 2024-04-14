import asyncHandler from '../utils/asyncHandler.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
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
    return {accessToken, refreshToken};
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
  console.log(req.body);
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
export { registerUser, loginUser, logoutUser };
