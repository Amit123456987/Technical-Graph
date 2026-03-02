const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { console } = require('inspector');
const { processFile } = require('./process.js');

// Import models and router
const { operations: nodesOps, connectDB: connectNodesDB } = require('./models/Nodes');
const { operations: edgesOps, connectDB: connectEdgesDB } = require('./models/Edges');
const { operations: lastMapOps, connectDB: connectLastMapDB } = require('./models/Last_Map');
const { buildAdjacencyList } = require('./models/Graph');

const sidebarRouter = require('./routes/sidebar');

const app = express();
app.use(cors());
const port = 3000;

app.use(express.json());

// Connect to MongoDB
const initializeDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
        await connectNodesDB();
        // await connectEdgesDB();
        // await connectLastMapDB();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        console.error('Please check your .env file and MongoDB connection');
        process.exit(1);
    }
};

// Use the sidebar router
app.use('/', sidebarRouter);

app.post('/create', async (req, res) => {

    const { name, text } = req.body;
    let nodeAndEdge = processFile(text);
    console.log('Received text:', nodeAndEdge);
    let docWithGivenName = await lastMapOps.get_last_mapByName(name);

    if (docWithGivenName) {
        return res.status(400).json({ error: 'This workspace already exists' });
    }

    // Check if file is provided and not empty    
    if (text && text.trim() !== '') {
        console.log('Text content:', text);
    } else {
        return res.status(400).json({ error: 'Either file or text must be provided and non-empty' });
    }

    const nodesResult = await nodesOps.createnodes({
        name: name,
        nodes: nodeAndEdge.nodes
    });

    const edgesResult = await edgesOps.createedges({
        name: name,
        edges: nodeAndEdge.edges
    });

    const mappingResult = await lastMapOps.create_last_map({
        name: name,
        node_id: nodesResult.id,
        edge_id: edgesResult.id
    });


    res.status(200).json({
        message: 'Nodes and edges updated successfully',
        data: {
            name: name,
            nodes: nodesResult.nodes,
            edges: edgesResult.edges,
            mapping: mappingResult
        }
    });
});

app.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Map name is required' });
        }

        // Find the latest map data by name
        const mapData = await lastMapOps.get_last_mapByName(name);
        
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }

        // Get the corresponding nodes and edges using their IDs from the latest map
        const [nodeData, edgeData] = await Promise.all([
            nodesOps.getnodesById(mapData.node_id),
            edgesOps.getedgesById(mapData.edge_id)
        ]);

        if (!nodeData || !edgeData) {
            return res.status(404).json({ error: 'Node or edge data not found' });
        }

        res.json({
            success: true,
            nodes: nodeData.nodes,
            edges: edgeData.edges,
            lastModified: mapData.updatedAt
        });
    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.post('/nodes/add', async (req, res) => {
    try {
        const { name, text } = req.body;

        if (!name || !text) {
            return res.status(400).json({ error: 'Map name and text are required' });
        }

        // Find the existing map by name
        const existingMap = await lastMapOps.get_last_mapByName(name);
        if (!existingMap) {
            return res.status(404).json({ error: 'Map not found' });
        }

        // Get existing nodes and edges
        const [existingNodeData, existingEdgeData] = await Promise.all([
            nodesOps.getnodesById(existingMap.node_id),
            edgesOps.getedgesById(existingMap.edge_id)
        ]);

        if (!existingNodeData || !existingEdgeData) {
            return res.status(404).json({ error: 'Node or edge data not found' });
        }

        // Get the current count from the last map
        const currentCount = (existingMap.count || 0) + 1;
        
        // Process the new text to get new nodes and edges
        let newNodesAndEdges = processFile(text);

        // Update node IDs to continue from the last count
        newNodesAndEdges.nodes = newNodesAndEdges.nodes.map((node, index) => ({
            ...node,
            id: currentCount + node.id
        }));

        // Update edge source and target IDs to match the new node IDs
        newNodesAndEdges.edges = newNodesAndEdges.edges.map(edge => {
            let sourceName = currentCount + edge.source;
            let targetName = currentCount + edge.target;
            let idName = currentCount + edge.source + "-" + edge.target;

            return {
                ...edge,
                id: idName,
                source: sourceName,
                target: targetName
            };
        });

        // Combine existing and new nodes/edges
        const combinedNodes = [...existingNodeData.nodes, ...newNodesAndEdges.nodes];
        const combinedEdges = [...existingEdgeData.edges, ...newNodesAndEdges.edges];

        // Update nodes and edges
        const [updatedNodes, updatedEdges] = await Promise.all([
            nodesOps.updatenodes(existingMap.node_id, {
                nodes: combinedNodes,
                name: name
            }),
            edgesOps.updateedges(existingMap.edge_id, {
                edges: combinedEdges,
                name: name
            })
        ]);

        // Update last_map count and timestamp
        await lastMapOps.update_last_map(existingMap.id, {
            count: currentCount,
            updatedAt: new Date()
        });

        res.status(200).json({
            message: 'Nodes and edges appended successfully',
            data: {
                name: name,
                nodes: updatedNodes.nodes,
                edges: updatedEdges.edges,
                newCount: currentCount
            }
        });

    } catch (error) {
        console.error('Error appending to map:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.delete('/map/delete/:name', async (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({ error: 'Map name is required' });
        }

        // Find the map data first
        const mapData = await lastMapOps.get_last_mapByName(name);
        
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }

        // Delete nodes and edges in parallel
        await Promise.all([
            nodesOps.deletenodes(mapData.node_id),
            edgesOps.deleteedges(mapData.edge_id),
            lastMapOps.delete_last_map(name)
        ]);

        res.status(200).json({
            success: true,
            message: `Map '${name}' and its associated data deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting map:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Start the server after database initialization
const startServer = async () => {
    try {
        await initializeDB();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();