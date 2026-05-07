import express from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image to Cloudinary (or local disk) and return the URL
 * @access  Private (Admin)
 */
router.post('/image', authenticate, requireRole('admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  let imageUrl = req.file.path;

  // If stored locally (no http prefix), build a fully qualified URL
  if (!imageUrl.startsWith('http')) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5001';
    imageUrl = `${protocol}://${host}/${imageUrl.replace(/\\/g, '/')}`;
  }

  return res.status(200).json({ success: true, url: imageUrl });
});

export default router;
