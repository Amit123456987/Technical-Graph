const express = require('express');
const router = express.Router();

// Import operations
const { operations: lastMapOps } = require('../models/Last_Map');
const { operations: nodesOps } = require('../models/Nodes');
const { operations: edgesOps } = require('../models/Edges');

// Get list of all maps
router.get('/list/maps', async (req, res) => {
    try {
        const allMaps = await lastMapOps.getAll_last_maps();
        const mapNames = allMaps.map(map => ({
            name: map.name,
            id: map.id
        }));

        res.status(200).json({
            success: true,
            count: mapNames.length,
            maps: mapNames
        });
    } catch (error) {
        console.error('Error fetching maps:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching map list'
        });
    }
});

// Get map by name
router.post('/map', async (req, res) => {
    try {
        const mapName = req.body.name;
        const mapData = await lastMapOps.get_last_mapByName(mapName);
        
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }

        const [nodes, edges] = await Promise.all([
            nodesOps.getnodesById(mapData.node_id),
            edgesOps.getedgesById(mapData.edge_id)
        ]);

        res.json({
            nodes: nodes?.nodes || [],
            edges: edges?.edges || []
        });
    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update map by name
router.put('/update/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { nodes: newNodes, edges: newEdges } = req.body;

        if (!name && !newNodes && !newEdges) {
            return res.status(400).json({ 
                success: false,
                error: 'Name, nodes, and edges are required' 
            });
        }

        // Find the existing map by name
        const existingMap = await lastMapOps.get_last_mapByName(name);
        
        if (!existingMap) {
            return res.status(404).json({ 
                success: false,
                error: 'Map not found' 
            });
        }

        // Update nodes and edges in parallel
        const [updatedNodes, updatedEdges] = await Promise.all([
            nodesOps.updatenodes(existingMap.node_id, {
                nodes: newNodes,
                name: name,
                updatedAt: new Date()
            }),
            edgesOps.updateedges(existingMap.edge_id, {
                edges: newEdges,
                name: name,
                updatedAt: new Date()
            })
        ]);

        // Update the last_map updatedAt timestamp
        await lastMapOps.update_last_map(existingMap.id, {
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Map updated successfully',
            data: {
                nodes: updatedNodes,
                edges: updatedEdges,
                lastModified: new Date()
            }
        });

    } catch (error) {
        console.error('Error updating map:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router;