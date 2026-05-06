import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFaqs);

// Admin only routes
router.post('/', authenticate, requireRole('admin'), createFaq);
router.patch('/:id', authenticate, requireRole('admin'), updateFaq);
router.delete('/:id', authenticate, requireRole('admin'), deleteFaq);

export default router;
