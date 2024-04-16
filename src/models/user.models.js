import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: 'Buddy',
      lowercase: true,
      trim: true,
      min: 3,
      max: 20,
    },
    lastName: {
      type: String,
      lowercase: true,
      trim: true,
      min: 3,
      max: 20,
    },
    bio: {
      type: String,
      default: '',
      trim:true,
      min: 10,
      max: 200,
    },
    gender: {
      type: String,
      enum: ['M', 'F', 'O'],
      default: 'O',
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      min: 3,
      max: 20,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'E-mail is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    avatar: {
      type: String, // cloudinary image url,
      default: 'https://avatar.iran.liara.run/public/boy?username=user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestaps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});
userSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`;
};
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      name: this.name,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
const User = mongoose.model('User', userSchema);
export default User;
