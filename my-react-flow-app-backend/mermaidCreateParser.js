/**
 * Converts Mermaid flowchart text into the same node/edge shape as process.js
 * (React Flow–style), using the third-party mermaid-ast parser only.
 */

const position = { x: 0, y: 0 };

/**
 * @param {string} text - Full Mermaid diagram (e.g. flowchart TD / graph LR …)
 * @returns {Promise<{ nodes: object[], edges: object[] }>}
 */
async function parseMermaidTextToReactFlow(text) {
    const { Flowchart } = await import('mermaid-ast');
    const flowchart = Flowchart.parse(String(text).trim());

    const nodes = flowchart.nodes.map((node) => ({
        id: node.id,
        data: { label: node?.text?.text ?? node.id },
        position: { ...position },
        sourcePosition: 'right',
        targetPosition: 'left'
    }));

    const edges = flowchart.links.map((link, index) => ({
        id: link.id || `${link.source}-${link.target}-${index}`,
        source: link.source,
        target: link.target,
        type: 'custom',
        label: link?.text?.text ?? ''
    }));

    return { nodes, edges };
}

module.exports = { parseMermaidTextToReactFlow };
