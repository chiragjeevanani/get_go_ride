import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);

// Admin only routes — image arrives as a plain URL string (uploaded separately via /api/upload)
router.post('/', authenticate, requireRole('admin'), createCategory);
router.patch('/:id', authenticate, requireRole('admin'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;
