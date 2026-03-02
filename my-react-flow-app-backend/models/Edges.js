const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Schema
const edgesSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString() // Auto-generate 
    },
    name: {
        type: String,
        required: true,
        default: 'custom'
    },
    edges: Array,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const edges = mongoose.model('Edges', edgesSchema);

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
    // Create new edges
    createedges: async (data) => {
        try {
            data.createdAt = new Date();
            data.updatedAt = new Date();
            const edge = new edges(data);
            return await edge.save();
        } catch (error) {
            throw new Error(`Error creating edges: ${error.message}`);
        }
    },

    // Get edges by ID
    getedgesById: async (id) => {
        try {
            return await edges.findOne({ id });
        } catch (error) {
            throw new Error(`Error fetching edges: ${error.message}`);
        }
    },

    // Update edges
    updateedges: async (id, data) => {
        try {
            return await edges.findOneAndUpdate(
                { id },
                { ...data, updatedAt: Date.now() }
                // { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating edges: ${error.message}`);
        }
    },

    // Delete edges
    deleteedges: async (id) => {
        try {
            return await edges.findOneAndDelete({ id });
        } catch (error) {
            throw new Error(`Error deleting edges: ${error.message}`);
        }
    },

    // Get all edgess
    getAlledgess: async () => {
        try {
            return await edges.find({});
        } catch (error) {
            throw new Error(`Error fetching edgess: ${error.message}`);
        }
    }
};

module.exports = { connectDB, operations };