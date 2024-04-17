import mongoose from 'mongoose';
import { videoSchema } from './video.models.js';
const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 30,
    },
    coverImage: {
      type: String,
      default: 'https://placehold.co/2560x1440',
    },
    about: {
      type: String,
      required: true,
      min: 10,
      max: 200,
    },
    category: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    videos: [videoSchema],
  },
  { timestamps: true }
);

const Channel = mongoose.model('Channel', channelSchema);
export default Channel;
