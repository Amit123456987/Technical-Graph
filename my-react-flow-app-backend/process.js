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

// Convert Mermaid line to nodes and edge
function processLine(line, fileName = "") {
  const nodes = line.split('-->');
  if (nodes.length !== 2) return;
  let edgeLabel = "";

  const createNode = (raw, filePrefix) => {
    edgeLabel = raw.match(/\|(.*)\|/) ? raw.match(/\|(.*)\|/)[1] : "";
    raw = raw.replace(/\|(.*)\|/, '').trim();
    const labelMatch = raw.match(/\[(.*)\]|\{(.*)\}|\((.*)\)/);
    raw = raw.replace(/\[(.*)\]|\{(.*)\}|\((.*)\)/, '').trim();
    const id = raw;
    const label = labelMatch ? labelMatch[1] : id;

    if (!uniqueNodeIds.has(id)) {
      uniqueNodeIds.add(id);
      nodeList.push({
        id,
        data: { label },
        position,
        sourcePosition: 'right',
        targetPosition: 'left'
      });
    }

    return id;
  };

  const source = createNode(nodes[0], fileName);
  const target = createNode(nodes[1], fileName);

  edgeList.push({
    id: `${source}-${target}`,
    source,
    target,
    type: "custom",
    label: edgeLabel
  });
}


function processFile(content) {
  const lines = content.toString().split("\n");
  nodeList = [];
  edgeList = [];
  uniqueNodeIds.clear();

  lines.forEach(line => {
    if (line.trim()) {
      processLine(line.trim(), "");
    }
  });

  return { nodes: nodeList, edges: edgeList };
}

module.exports = {processFile};