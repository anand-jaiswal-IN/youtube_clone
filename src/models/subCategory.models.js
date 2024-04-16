import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      default: "https://via.placeholder.com/300x300.png?text=Image+Not+Found",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;