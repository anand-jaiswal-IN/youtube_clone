import mongoose from 'mongoose';

const likeOrDisklikeSchema = new mongoose.Schema({
  on: {
    type: String,
    enum: ['C', 'V', 'T'], // C-comment, V-video, T-tweet
    required: true,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  isDisliked: {
    type: Boolean,
    default: false,
  },
  onComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  onVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
  },
  onTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});
likeOrDisklikeSchema.pre('save', async function (next) {
  if (this.isModified('isLiked')) {
    this.isDisliked = false;
  }
  if (this.isModified('isDisliked')) {
    this.isLiked = false;
  }
  next();
});
const LikeOrDislike = mongoose.model('LikeOrDislike', likeOrDisklikeSchema);

export default LikeOrDislike;
