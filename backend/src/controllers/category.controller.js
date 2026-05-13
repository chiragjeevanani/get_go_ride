import Category from '../models/Category.model.js';
import { success, error } from '../utils/response.js';

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    success(res, categories, 'Categories retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create a new category (Admin only)
 * @access  Private (Admin)
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, order } = req.body;

    const targetSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    const existing = await Category.findOne({ slug: targetSlug });
    if (existing) return error(res, 'Category slug already exists', 400, 'BAD_REQUEST');

    const category = await Category.create({ 
      name, 
      slug: targetSlug, 
      description, 
      image: image || '',
      order: Number(order) || 0 
    });
    success(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/categories/:id
 * @desc    Update a category (Admin only)
 * @access  Private (Admin)
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, order } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (image !== undefined) updateData.image = image;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) return error(res, 'Category not found', 404, 'NOT_FOUND');
    success(res, category, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category (Admin only)
 * @access  Private (Admin)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return error(res, 'Category not found', 404, 'NOT_FOUND');
    success(res, null, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
};
