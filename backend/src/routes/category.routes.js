import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);

// Admin only routes
router.post('/', authenticate, requireRole('admin'), createCategory);
router.patch('/:id', authenticate, requireRole('admin'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;
