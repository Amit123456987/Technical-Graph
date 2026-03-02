const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Schema
const last_map_Schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString() // Auto-generate 
  },
  name: String,
  node_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString() // Auto-generate 
  },
  edge_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString() // Auto-generate 
  },
  count: {
    type: Number,
    default: 0,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const last_map = mongoose.model('Last_Map', last_map_Schema);

// Connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// CRUD operations
const operations = {
  // Create new last_map
  create_last_map: async (data) => {
    try {
      // Add created_at and updated_at timestamps
      data.created_at = data.created_at || new Date();
      data.updated_at = new Date();

       // Using findOneAndUpdate with upsert option
       const result = await last_map.findOneAndUpdate(
        { node_id: data.node_id }, // search criteria
        data, // update data
        {
          upsert: true, // create if doesn't exist
          new: true, // return the updated/created document
          setDefaultsOnInsert: true // apply schema defaults if creating new doc
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error creating last_map: ${error.message}`);
    }
  },

  // Get last_map by ID
  get_last_mapByName: async (name) => {
    try {
      return await last_map.findOne({ name });
    } catch (error) {
      throw new Error(`Error fetching last_map: ${error.message}`);
    }
  },

  // Update last_map
  update_last_map: async (id, data) => {
    try {
      return await last_map.findOneAndUpdate(
        { id },
        { ...data, updatedAt: Date.now() }
        // { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating last_map: ${error.message}`);
    }
  },

  // Delete last_map
  delete_last_map: async (name) => {
    try {
      return await last_map.findOneAndDelete({ name });
    } catch (error) {
      throw new Error(`Error deleting last_map: ${error.message}`);
    }
  },

  // Get all last_maps
  getAll_last_maps: async () => {
    try {
      return await last_map.find({}).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching last_maps: ${error.message}`);
    }
  }
};

module.exports = { connectDB, operations };