import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 30,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      min : 5,
      max : 200,
      trim : true
    },
    imageURL: {
      type: String,
      default: 'https://via.placeholder.com/300x300.png?text=Image+Not+Found',
    },
  },
  { timestamps: true }
);
const Category = mongoose.model('Category', categorySchema);
export default Category;
