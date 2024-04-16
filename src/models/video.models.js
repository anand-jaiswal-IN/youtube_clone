import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      min: 3,
      max: 70,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      min: 3,
      max: 2000,
    },
    videoFile: {
      type: String,
      required: [true, 'Video file is required'],
    },
    thumbnail: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
    },
    category: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      required: true,
    },
    sub_category: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
    },
    views: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
  },
  { timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model('Video', videoSchema);
export default Video;
