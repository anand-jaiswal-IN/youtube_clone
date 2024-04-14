import asyncHandler from '../utils/asyncHandler.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/user.models.js';
import uploadFile from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
  {
    // get user details from frontend
    // validation - not empty
    // check if user already is exits
    // check for images, check for avatar
    // uplaod them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
  }
  const { username, email, password } = req.body;

  if (validateEmail(email)) {
    throw new ApiError(400, 'Invalid Email');
  }
  if (validatePassword(password)) {
    throw new ApiError(400, 'Invalid Password');
  }
  if (User.findOne({ username })) {
    throw new ApiError(409, 'Username already in use, Try another one.');
  }
  if (User.findOne({ $or: [{ email }, { username }] })) {
    throw new ApiError(
      409,
      'Email or Username already exists. Try with another email'
    );
  }
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar.path;
  const avatar = await uploadFile(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, 'Something went wrong while uploading avatar');
  }
  const user = await User.create({
    username,
    email,
    password,
    avatar: avatar.url,
  });

  const createdUser = User.findById(user._id).select('-password -refreshToken');
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User created Successfully"),
  );
});

export { registerUser };
