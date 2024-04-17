import express from 'express';
import { createCategory, updateImageOfCategory, getAllCategories } from '../controllers/category.controller.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();


// category
router.route("/category/create").post(createCategory)
router.route("/category/update-image/:categoryID").post(upload.single('image'),updateImageOfCategory)


export default router;