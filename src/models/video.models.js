import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 70,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 2000,
    },
    videoFile: {
      type: String,
      required: true,
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
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
