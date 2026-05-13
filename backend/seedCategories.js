import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.model.js';

dotenv.config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = [
      {
        name: 'Goods Transport',
        slug: 'goods-transport',
        description: 'Commercial or bulk items',
        icon: 'Package',
        order: 1
      },
      {
        name: 'House Shifting',
        slug: 'house-shifting',
        description: 'Furniture & household items',
        icon: 'Briefcase',
        order: 2
      },
      {
        name: 'Construction Service',
        slug: 'construction',
        description: 'Building & heavy material',
        icon: 'Truck',
        order: 3
      },
      {
        name: 'Emergency Dispatch',
        slug: 'emergency',
        description: 'Instant response services',
        icon: 'Truck',
        order: 4
      }
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedCategories();
