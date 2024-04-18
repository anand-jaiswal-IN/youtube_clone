import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    on: {
      type: String,
      enum: ['V', 'T'], // C-comment, V-video, T-tweet
      required: true,
    },
    content: {
      type: String,
      required: true,
      min: 10,
      max: 2000,
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
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
