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
      type: Number,
      required: true,
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
      required:true
    },
  },
  { timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.methods.isVideoViewed = async function (user) {
  return this.views.includes(user?._id);
};
videoSchema.methods.hasItsChannel = async function (channel) {
  return this.owner.equals(channel._id)
};
const Video = mongoose.model('Video', videoSchema);
export default Video;
