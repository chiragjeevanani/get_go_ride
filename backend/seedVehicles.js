import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from './src/models/Vehicle.model.js';
import Category from './src/models/Category.model.js';

dotenv.config();

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Wipe existing vehicles for clean seed
    await Vehicle.deleteMany({});
    console.log('Cleared existing vehicles');

    // Fetch existing categories to align slugs perfectly
    const categories = await Category.find({});
    console.log('Current registered categories in DB:', categories.map(c => c.slug));

    // Define defaults
    const defaultVehicles = [
      // Category: Goods Transport
      {
        name: '2.5 Tonnes - 8 ft',
        capacity: '2.5 Tonnes',
        details: 'LCV • 4 Tyres • Open Body',
        categorySlug: 'goods',
        isMostBooked: true,
        order: 1
      },
      {
        name: '3 Tonnes - 10 ft',
        capacity: '3 Tonnes',
        details: 'LCV • 4 Tyres • Open Body',
        categorySlug: 'goods',
        isMostBooked: false,
        order: 2
      },
      {
        name: '5 Tonnes - 14 ft',
        capacity: '5 Tonnes',
        details: 'ICV • 6 Tyres • Closed Container',
        categorySlug: 'goods',
        isMostBooked: false,
        order: 3
      },
      {
        name: '7 Tonnes - 17 ft',
        capacity: '7 Tonnes',
        details: 'HCV • 6 Tyres • High Deck',
        categorySlug: 'goods',
        isMostBooked: false,
        order: 4
      },

      // Category: House Shifting
      {
        name: 'Tata Ace - 7 ft',
        capacity: '800kg',
        details: '4 Tyres • Small Furniture',
        categorySlug: 'house',
        isMostBooked: true,
        order: 1
      },
      {
        name: 'Bolero Pickup',
        capacity: '1.2 Tonnes',
        details: '4 Tyres • Medium Load',
        categorySlug: 'house',
        isMostBooked: false,
        order: 2
      },
      {
        name: 'Eicher 14ft',
        capacity: '5 Tonnes',
        details: '6 Tyres • Household Bulky',
        categorySlug: 'house',
        isMostBooked: false,
        order: 3
      },

      // Category: Emergency Dispatch
      {
        name: 'Basic Ambulance',
        capacity: 'Patient',
        details: 'First Aid • Oxygen Support',
        categorySlug: 'emergency',
        isMostBooked: true,
        order: 1
      },
      {
        name: 'ICU Ventilator',
        capacity: 'Patient ICU',
        details: 'Critical Care • Life Support',
        categorySlug: 'emergency',
        isMostBooked: false,
        order: 2
      },
      {
        name: 'Towing Truck',
        capacity: 'Vehicle',
        details: '24/7 Roadside Recovery',
        categorySlug: 'emergency',
        isMostBooked: false,
        order: 3
      },

      // Category: Construction Service
      {
        name: 'Tipper Truck',
        capacity: '10 Tonnes',
        details: '6 Tyres • Sand/Brick',
        categorySlug: 'construction',
        isMostBooked: true,
        order: 1
      },
      {
        name: 'JCB / Loader',
        capacity: 'Excavator',
        details: 'Heavy Excavator',
        categorySlug: 'construction',
        isMostBooked: false,
        order: 2
      },
      {
        name: 'Mobile Crane',
        capacity: '10T+',
        details: 'Lifting 10T+',
        categorySlug: 'construction',
        isMostBooked: false,
        order: 3
      }
    ];

    // Align slugs with DB categories if needed (e.g. if category is "goods-transport" instead of "goods")
    const updatedVehicles = defaultVehicles.map(veh => {
      let finalSlug = veh.categorySlug;
      // Find a category that matches either exactly or begins with the prefix
      const matchedCat = categories.find(c => c.slug === veh.categorySlug || c.slug.startsWith(veh.categorySlug));
      if (matchedCat) {
        finalSlug = matchedCat.slug;
      }
      return { ...veh, categorySlug: finalSlug };
    });

    await Vehicle.insertMany(updatedVehicles);
    console.log(`Successfully seeded ${updatedVehicles.length} vehicles!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedVehicles();
