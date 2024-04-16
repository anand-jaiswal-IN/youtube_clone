import Category from '../models/category.models.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import uploadFile from '../utils/cloudinary.js';

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, 'Bad Request, Field are Required');
  }
  if (name?.trim().length < 4 || name?.trim().length > 30) {
    throw new ApiError(400, 'Name field is NOT valid');
  }
  if (description?.trim().length < 5 || description?.trim().length > 200) {
    throw new ApiError(400, 'Description field is NOT valid');
  }
  if (await Category.findOne({ name: { $regex: name, $options: 'i' } })) {
    throw new ApiError(400, 'Category already exists');
  }
  const category = await Category.create({
    name,
    description,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, category, 'Category created'));
});
const updateImageOfCategory = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Bad Request. Field is required');
  }
  if (req.file.size > 100 * 1000) {
    // if file is more than 100kb
    throw new ApiError(
      400,
      'Category Image have exceed the file limit. Required less than 100kb'
    );
  }
  const image = await uploadFile(req.file.path);
  const category = await Category.findByIdAndUpdate(
    req.params.categoryID,
    {
      $set: {
        imageURL: image.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, category, 'Category Image Updated'));
});
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res
    .status(200)
    .json(new ApiResponse(200, categories, 'Categories fetched'));
});

export { createCategory, updateImageOfCategory, getAllCategories };
