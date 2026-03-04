const fs = require('fs');
const { console } = require('inspector');
const { type } = require('os');
const path = require('path');

const edgeType = 'smoothstep';
const position = { x: 0, y: 0 };

let nodeList = [];
let edgeList = [];
const uniqueNodeIds = new Set();


// Read all files in the folder
function listFilesInFolder(folder) {
  try {
    return fs.readdirSync(folder).filter(file => fs.lstatSync(path.join(folder, file)).isFile());
  } catch (error) {
    console.error(`Error reading folder: ${error.message}`);
    return [];
  }
}

// Parse a single Mermaid node expression like:
// A, A[text], A("text"), A{text}, A((text))
function parseNode(raw) {
  let text = raw.trim();

  // Strip trailing semicolon if present
  if (text.endsWith(';')) {
    text = text.slice(0, -1).trim();
  }

  // Node id = first token before bracket/brace/paren/space
  const idMatch = text.match(/^([A-Za-z0-9_\-:.]+)/);
  const id = idMatch ? idMatch[1] : text;

  // Try to extract a human label from brackets/braces/parens or quotes
  const labelMatch = text.match(/\[(.*)\]|\{(.*)\}|\((.*)\)|\"(.*)\"|'(.*)'/);
  let label = id;
  if (labelMatch) {
    for (let i = 1; i < labelMatch.length; i += 1) {
      if (labelMatch[i]) {
        label = labelMatch[i].trim();
        break;
      }
    }
  }

  if (!uniqueNodeIds.has(id)) {
    uniqueNodeIds.add(id);
    nodeList.push({
      id,
      data: { label },
      position,
      sourcePosition: 'right',
      targetPosition: 'left',
    });
  }

  return id;
}

// Convert a Mermaid edge line to nodes and edge
function processLine(line) {
  let text = line.trim();
  if (!text) return;

  // Strip Mermaid comments
  const commentIndex = text.indexOf('%%');
  if (commentIndex !== -1) {
    text = text.slice(0, commentIndex).trim();
  }
  if (!text) return;

  // Skip non-edge / directive lines
  if (
    text.startsWith('graph ') ||
    text.startsWith('flowchart ') ||
    text.startsWith('subgraph ') ||
    text === 'end' ||
    text.startsWith('classDef ') ||
    text.startsWith('linkStyle ') ||
    text.startsWith('style ')
  ) {
    return;
  }

  // Extract edge label of the form |label|
  let edgeLabel = '';
  const labelMatch = text.match(/\|([^|]+)\|/);
  if (labelMatch) {
    edgeLabel = labelMatch[1].trim();
    text = text.replace(/\|[^|]+\|/, '');
  }

  // Split on main Mermaid edge operators
  const parts = text.split(/-->|---/);
  if (parts.length !== 2) {
    return;
  }

  const sourceId = parseNode(parts[0]);
  const targetId = parseNode(parts[1]);
  if (!sourceId || !targetId) return;

  edgeList.push({
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: 'custom',
    label: edgeLabel,
  });
}

function processFile(content) {
  const lines = content.toString().split('\n');
  nodeList = [];
  edgeList = [];
  uniqueNodeIds.clear();

  for (const line of lines) {
    if (line.trim()) {
      processLine(line);
    }
  }

  return { nodes: nodeList, edges: edgeList };
}

module.exports = {processFile};