import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 4,
      max: 30,
    },
    description: {
      type: String,
      required: true,
      min: 10,
      max: 200,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
