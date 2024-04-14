import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jst from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: {
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
      },
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
      type: String, // cloudinary image url
      default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
    coverImg: {
      type: String, // cloudinary image url
      default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
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
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jst.sign(
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
  return jst.sign(
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
