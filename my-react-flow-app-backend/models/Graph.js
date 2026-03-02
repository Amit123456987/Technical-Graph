const mongoose = require('mongoose');

// Adjacency node schema (for each node in the graph)
const adjacencyNodeSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Node ID
  name: { type: String, required: true },
  neighbors: [{ type: String }]
}, { _id: false });

// Main adjacency list schema (per graph)
const adjacencyListSchema = new mongoose.Schema({
  graph: { type: String, required: true }, // Graph name
  edges: [adjacencyNodeSchema]
});

const AdjacencyList = mongoose.model('AdjacencyList', adjacencyListSchema);

// Function to build adjacency list from nodes and edges
async function buildAdjacencyList(graphName, nodes, edges) {
  // nodes: [{id, label/name}]
  // edges: [{source, target}]
  const adjNodes = nodes.map(node => {
    const neighbors = edges
      .filter(edge => edge.source === node.id)
      .map(edge => edge.target);
    return {
      _id: node.id,
      name: node.label || node.name,
      neighbors
    };
  });

  // Upsert the adjacency list for the graph
  await AdjacencyList.findOneAndUpdate(
    { graph: graphName },
    { graph: graphName, edges: adjNodes },
    { upsert: true, new: true }
  );
}

module.exports = { AdjacencyList, buildAdjacencyList };