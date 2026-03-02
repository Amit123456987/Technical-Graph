const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Schema
const nodesSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString() // Auto-generate 
  },
  nodes: Array,
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const nodes = mongoose.model('Nodes', nodesSchema);

// Connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// CRUD operations
const operations = {
  // Create new nodes
  createnodes: async (data) => {
    try {
      data.createdAt = new Date();
      data.updatedAt = new Date();
      const node = new nodes(data);
      return await node.save();
    } catch (error) {
      throw new Error(`Error creating nodes: ${error.message}`);
    }
  },

  // Get nodes by ID
  getnodesById: async (id) => {
    try {
      return await nodes.findOne({ id });
    } catch (error) {
      throw new Error(`Error fetching nodes: ${error.message}`);
    }
  },
   // Get nodes by ID
   getnodesByNames: async (name) => {
    try {
      return await nodes.findOne({ name });
    } catch (error) {
      throw new Error(`Error fetching nodes: ${error.message}`);
    }
  },
  // Update nodes
  updatenodes: async (id, data) => {
    try {
      return await nodes.findOneAndUpdate(
        { id },
        { ...data, updatedAt: Date.now() },
        // { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating nodes: ${error.message}`);
    }
  },

  // Delete nodes
  deletenodes: async (id) => {
    try {
      return await nodes.findOneAndDelete({ id });
    } catch (error) {
      throw new Error(`Error deleting nodes: ${error.message}`);
    }
  },

  // Get all nodess
  getAllnodess: async () => {
    try {
      return await nodes.find({});
    } catch (error) {
      throw new Error(`Error fetching nodess: ${error.message}`);
    }
  }
};

module.exports = { connectDB, operations };