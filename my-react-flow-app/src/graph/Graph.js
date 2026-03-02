/**
 * Graph data structure built from React Flow nodes and edges.
 * Uses adjacency lists for successors (outgoing) and predecessors (incoming).
 */

export class Graph {
  /**
   * @param {Array<{ id: string, data?: object, [key: string]: any }>} nodes - React Flow nodes
   * @param {Array<{ id: string, source: string, target: string, [key: string]: any }>} edges - React Flow edges
   */
  constructor(nodes = [], edges = []) {
    /** @type {Map<string, object>} node id -> node data */
    this._nodes = new Map();
    /** @type {Map<string, object>} edge id -> edge data */
    this._edges = new Map();
    /** @type {Map<string, Set<string>>} node id -> set of successor (target) node ids */
    this._successors = new Map();
    /** @type {Map<string, Set<string>>} node id -> set of predecessor (source) node ids */
    this._predecessors = new Map();

    nodes.forEach((n) => this.addNode(n));
    edges.forEach((e) => this.addEdge(e));
  }

  // ---------- Node operations ----------

  /** @param {object} node - { id, data?, ... } */
  addNode(node) {
    const id = node.id;
    this._nodes.set(id, { ...node });
    if (!this._successors.has(id)) this._successors.set(id, new Set());
    if (!this._predecessors.has(id)) this._predecessors.set(id, new Set());
    return this;
  }

  /** @param {string} id */
  removeNode(id) {
    if (!this._nodes.has(id)) return this;
    const succ = this._successors.get(id);
    const pred = this._predecessors.get(id);
    succ.forEach((targetId) => this._predecessors.get(targetId)?.delete(id));
    pred.forEach((sourceId) => this._successors.get(sourceId)?.delete(id));
    this._edges.forEach((edge, edgeId) => {
      if (edge.source === id || edge.target === id) this._edges.delete(edgeId);
    });
    this._nodes.delete(id);
    this._successors.delete(id);
    this._predecessors.delete(id);
    return this;
  }

  /** @param {string} id */
  hasNode(id) {
    return this._nodes.has(id);
  }

  /** @param {string} id */
  getNode(id) {
    return this._nodes.get(id) ?? null;
  }

  /** @returns {string[]} */
  getNodeIds() {
    return Array.from(this._nodes.keys());
  }

  /** @returns {object[]} */
  getNodes() {
    return Array.from(this._nodes.values());
  }

  // ---------- Edge operations ----------

  /** @param {object} edge - { id, source, target, ... } */
  addEdge(edge) {
    const { id, source, target } = edge;
    if (!this._nodes.has(source)) this.addNode({ id: source, data: {} });
    if (!this._nodes.has(target)) this.addNode({ id: target, data: {} });
    this._edges.set(id, { ...edge });
    this._successors.get(source).add(target);
    this._predecessors.get(target).add(source);
    return this;
  }

  /** @param {string} id - edge id */
  removeEdge(id) {
    const edge = this._edges.get(id);
    if (!edge) return this;
    const { source, target } = edge;
    this._successors.get(source)?.delete(target);
    this._predecessors.get(target)?.delete(source);
    this._edges.delete(id);
    return this;
  }

  /** @param {string} sourceId @param {string} targetId */
  hasEdge(sourceId, targetId) {
    return this._successors.get(sourceId)?.has(targetId) ?? false;
  }

  /** @param {string} id - edge id */
  getEdge(id) {
    return this._edges.get(id) ?? null;
  }

  /** @returns {object[]} */
  getEdges() {
    return Array.from(this._edges.values());
  }

  /** @returns {string[]} */
  getEdgeIds() {
    return Array.from(this._edges.keys());
  }

  // ---------- Neighborhood & degree ----------

  /** Nodes that this node points to (targets of outgoing edges). */
  getSuccessors(nodeId) {
    return Array.from(this._successors.get(nodeId) ?? []);
  }

  /** Nodes that point to this node (sources of incoming edges). */
  getPredecessors(nodeId) {
    return Array.from(this._predecessors.get(nodeId) ?? []);
  }

  /** All adjacent nodes (successors + predecessors). */
  getNeighbors(nodeId) {
    const succ = this.getSuccessors(nodeId);
    const pred = this.getPredecessors(nodeId);
    return [...new Set([...succ, ...pred])];
  }

  /** Number of outgoing edges. */
  getOutDegree(nodeId) {
    return (this._successors.get(nodeId)?.size ?? 0);
  }

  /** Number of incoming edges. */
  getInDegree(nodeId) {
    return (this._predecessors.get(nodeId)?.size ?? 0);
  }

  /** Total number of edges incident to this node. */
  getDegree(nodeId) {
    return this.getInDegree(nodeId) + this.getOutDegree(nodeId);
  }

  // ---------- Traversal ----------

  /**
   * Breadth-first search from a start node.
   * @param {string} startId
   * @param {'successors'|'predecessors'|'both'} direction
   * @returns {string[]} node ids in BFS order
   */
  bfs(startId, direction = 'successors') {
    if (!this.hasNode(startId)) return [];
    const visited = new Set();
    const queue = [startId];
    visited.add(startId);
    const result = [];

    const getNext = (id) => {
      if (direction === 'successors') return this.getSuccessors(id);
      if (direction === 'predecessors') return this.getPredecessors(id);
      return this.getNeighbors(id);
    };

    while (queue.length > 0) {
      const id = queue.shift();
      if( id != startId){
        result.push(id);
      }
      
      for (const nextId of getNext(id)) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push(nextId);
        }
      }
    }
    return result;
  }

  /**
   * Depth-first search from a start node.
   * @param {string} startId
   * @param {'successors'|'predecessors'|'both'} direction
   * @returns {string[]} node ids in DFS order
   */
  dfs(startId, direction = 'successors') {
    if (!this.hasNode(startId)) return [];
    const visited = new Set();
    const result = [];

    const getNext = (id) => {
      if (direction === 'successors') return this.getSuccessors(id);
      if (direction === 'predecessors') return this.getPredecessors(id);
      return this.getNeighbors(id);
    };

    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      result.push(id);
      for (const nextId of getNext(id)) visit(nextId);
    };

    visit(startId);
    return result;
  }

  /**
   * Find a path from source to target using BFS (shortest path in number of edges).
   * @returns {string[]|null} node ids from source to target, or null if no path
   */
  findPath(sourceId, targetId, direction = 'successors') {
    if (!this.hasNode(sourceId) || !this.hasNode(targetId)) return null;
    if (sourceId === targetId) return [sourceId];

    const visited = new Set([sourceId]);
    const queue = [[sourceId]];
    const getNext = (id) => (direction === 'successors' ? this.getSuccessors(id) : this.getPredecessors(id));

    while (queue.length > 0) {
      const path = queue.shift();
      const last = path[path.length - 1];
      for (const nextId of getNext(last)) {
        if (nextId === targetId) return [...path, nextId];
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push([...path, nextId]);
        }
      }
    }
    return null;
  }

  // ---------- Structure ----------

  /** Number of nodes. */
  get nodeCount() {
    return this._nodes.size;
  }

  /** Number of edges. */
  get edgeCount() {
    return this._edges.size;
  }

  /**
   * Return nodes and edges in React Flow–friendly format (new arrays).
   * @returns {{ nodes: object[], edges: object[] }}
   */
  toReactFlow() {
    return {
      nodes: this.getNodes().map((n) => ({ ...n })),
      edges: this.getEdges().map((e) => ({ ...e })),
    };
  }

  /**
   * Build a new Graph from React Flow nodes and edges.
   * @param {object[]} nodes
   * @param {object[]} edges
   * @returns {Graph}
   */
  static fromReactFlow(nodes, edges) {
    return new Graph(nodes, edges);
  }
}
