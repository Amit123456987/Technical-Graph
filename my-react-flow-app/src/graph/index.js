/**
 * Graph utilities for React Flow nodes and edges.
 */

export { Graph } from './Graph.js';

/**
 * Get all node IDs that are targets of edges from the given node (successors).
 * @param {object[]} edges - Array of { source, target }
 * @param {string} nodeId
 * @returns {string[]}
 */
export function getSuccessorsFromEdges(edges, nodeId) {
  return [...new Set(edges.filter((e) => e.source === nodeId).map((e) => e.target))];
}

/**
 * Get all node IDs that are sources of edges to the given node (predecessors).
 * @param {object[]} edges
 * @param {string} nodeId
 * @returns {string[]}
 */
export function getPredecessorsFromEdges(edges, nodeId) {
  return [...new Set(edges.filter((e) => e.target === nodeId).map((e) => e.source))];
}

/**
 * Get node by id from nodes array.
 * @param {object[]} nodes
 * @param {string} id
 * @returns {object|null}
 */
export function getNodeById(nodes, id) {
  return nodes.find((n) => n.id === id) ?? null;
}

/**
 * Check if there is an edge from source to target.
 * @param {object[]} edges
 * @param {string} sourceId
 * @param {string} targetId
 * @returns {boolean}
 */
export function hasEdge(edges, sourceId, targetId) {
  return edges.some((e) => e.source === sourceId && e.target === targetId);
}
