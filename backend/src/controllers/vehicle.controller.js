import Vehicle from '../models/Vehicle.model.js';
import { success, error } from '../utils/response.js';

// ─── GET /api/vehicles ────────────────────────────────────────────────────────
export const getVehicles = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const filter = { isActive: true };
    if (category) {
      filter.$or = [
        { categorySlug: category },
        { categorySlugs: category }
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ order: 1, createdAt: 1 });
    return success(res, vehicles, 'Vehicles retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/vehicles (Admin Only) ──────────────────────────────────────────
export const createVehicle = async (req, res, next) => {
  try {
    const { name, capacity, details, image, categorySlug, categorySlugs, isMostBooked, order } = req.body;

    const slugs = Array.isArray(categorySlugs) && categorySlugs.length > 0 
      ? categorySlugs 
      : (categorySlug ? [categorySlug] : []);

    if (!name || !capacity || slugs.length === 0) {
      return error(res, 'Name, capacity, and category classification are required fields', 400);
    }

    const vehicle = await Vehicle.create({
      name,
      capacity,
      details: details || '',
      image: image || '',
      categorySlug: slugs[0] || '',
      categorySlugs: slugs,
      isMostBooked: !!isMostBooked,
      order: Number(order) || 0,
    });

    return success(res, vehicle, 'Vehicle class registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/vehicles/:id (Admin Only) ──────────────────────────────────────
export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, capacity, details, image, categorySlug, categorySlugs, isMostBooked, order, isActive } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return error(res, 'Vehicle class not found', 404);
    }

    if (name !== undefined) vehicle.name = name;
    if (capacity !== undefined) vehicle.capacity = capacity;
    if (details !== undefined) vehicle.details = details;
    if (image !== undefined) vehicle.image = image;
    
    if (categorySlugs !== undefined) {
      vehicle.categorySlugs = Array.isArray(categorySlugs) ? categorySlugs : [];
    } else if (categorySlug !== undefined) {
      vehicle.categorySlug = categorySlug;
      vehicle.categorySlugs = [categorySlug];
    }

    if (isMostBooked !== undefined) vehicle.isMostBooked = !!isMostBooked;
    if (order !== undefined) vehicle.order = Number(order) || 0;
    if (isActive !== undefined) vehicle.isActive = !!isActive;

    await vehicle.save();
    return success(res, vehicle, 'Vehicle class updated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/vehicles/:id (Admin Only) ────────────────────────────────────
export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return error(res, 'Vehicle class not found', 404);
    }

    await vehicle.deleteOne();
    return success(res, null, 'Vehicle class removed successfully');
  } catch (err) {
    next(err);
  }
};
