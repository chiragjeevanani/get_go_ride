import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_NAME && 
  process.env.CLOUDINARY_KEY && 
  process.env.CLOUDINARY_SECRET;

let storage;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'getgoload/vendors',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
  });
} else {
  // Graceful fallback to local disk storage if Cloudinary is not configured in .env
  const uploadDir = 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

export const upload = multer({ storage: storage });
export { cloudinary };
