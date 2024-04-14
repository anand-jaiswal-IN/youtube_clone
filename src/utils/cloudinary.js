import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFile(localFilePath) {
  try {
    if (!file) return null;
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    console.log('File is uploaded successfully on cloudinary : ', res.url);
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
    console.log('CLOUDINARY ERROR : ', error);
  }
}

export default uploadFile;