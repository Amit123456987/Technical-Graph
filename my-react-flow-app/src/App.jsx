import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MiniMap,
  Background,
  Controls,
  Panel,
  Position,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
import { initialNodes, initialEdges } from './initialElements';
import TextUpdaterNode from '../textUpdater';
import SideBar from './SideBar';
import FileUploadModal from './FileUploadModal';
import "./App.css";
import AlgoButton from './components/Button';
import CustomEdge from './components/CustomEdge';
import { Graph } from './graph';

const elk = new ELK();
const edgeTypes = {
  custom: CustomEdge,
};
const nodeTypes = {
  default: TextUpdaterNode,
  textUpdater: TextUpdaterNode,
};

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
  const defaultOptions = {
    // 'elk.algorithm': 'layered',
    // 'elk.spacing.nodeNode': 120,// horizontal space between nodes — increase for more gap
    'elk.layered.spacing.nodeNodeBetweenLayers': 200,// vertical space between layers — increase for more gap
  };

  const getLayoutedElements = useCallback((options) => {
    const layoutOptions = { ...defaultOptions, ...options };
    const graph = {
      id: 'root',
      layoutOptions: layoutOptions,
      children: getNodes().map((node) => ({
        ...node,
        width: node.measured.width,
        height: node.measured.height,
      })),
      edges: getEdges(),
    };

    elk.layout(graph).then(({ children }) => {
      // By mutating the children in-place we saves ourselves from creating a
      // needless copy of the nodes array.
      children.forEach((node) => {
        node.position = { x: node.x, y: node.y };
      });

      setNodes(children);
      fitView();
    });
  }, []);

  return { getLayoutedElements };
};

const buttonStyle = {
  backgroundColor: '#000000',
  color: 'white',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginLeft: '8px',
  boxShadow: '0px 4px 6px rgba(233, 231, 231, 0.97)',
  transform: 'translateY(-2px)',
}

const Flow = () => {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [colorMode, setColorMode] = useState('dark');
  const [saveStatus, setSaveStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showNodes, setShowNodes] = useState(true); // ON = nodes visible, OFF = nodes hidden
  const [name, setName] = useState('');
  const [deleteConfirmName, setDeleteConfirmName] = useState(null); // graph name when delete confirmation is open
  const { getLayoutedElements } = useLayoutedElements();
  const [config, setConfig] = useState({});

  // Graph built from current nodes and edges; updates when they change
  const graph = useMemo(() => new Graph(nodes, edges), [nodes, edges]);

  const handleSubmit = async (formData) => {
    try {

      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:3000/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json" // Important! Tells server you're sending JSON
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      alert('File uploaded successfully!');

      // let { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(result.data.nodes, result.data.edges);
      getLayoutedElements(config);
      setName(result.data.name);
      // setNodes(layoutedNodes);
      // setEdges(layoutedEdges);
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading file');
    }
  };

  const handleAddSubmit = async (formData) => {
    try {

      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:3000/nodes/add', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json" // Important! Tells server you're sending JSON
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      alert('File uploaded successfully!');

      // let { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(result.data.nodes, result.data.edges);
      getLayoutedElements(config);

      setName(result.data.name);
      // setNodes(layoutedNodes);
      // setEdges(layoutedEdges);
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading file');
    }
  };

  // Load saved nodes on initial render
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        // Get the name from localStorage
        const savedName = localStorage.getItem('name');

        if (!savedName) {
          console.log("No saved name found in localStorage");
          return;
        }

        // Fetch the map data using POST request with the saved name
        const response = await fetch('http://localhost:3000/map', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: savedName })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch nodes');
        }

        const data = await response.json();
        console.log("Fetched nodes:", data);

        if (data && data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          setName(savedName);
        }
      } catch (error) {
        console.error('Error fetching nodes:', error);
      }
    };

    fetchNodes();
  }, []);

  // Save nodes to localStorage and prepare file download
  const saveNodes = useCallback((nodes, edges) => {
    const nodesToSave = nodes.map(node => ({
      ...node,
      position: node.position,
      data: node.data,
    }));

    const saveNodesToAPI = async () => {
      try {
        setNodes(nodesToSave);

        // Get the current map name from localStorage
        const currentMapName = localStorage.getItem('name');
        if (!currentMapName) {
          throw new Error('No map name found in localStorage');
        }

        // Save to API using PUT request
        const response = await fetch(`http://localhost:3000/update/${encodeURIComponent(currentMapName)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nodes: nodesToSave,
            edges: edges
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save map');
        }

        const data = await response.json();
        console.log('Map successfully saved:', data);
        setSaveStatus('Map successfully saved!');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('Error saving map:', error);
        setSaveStatus(`Error saving map: ${error.message}`);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    };

    saveNodesToAPI();
  }, [nodes, edges]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (event) => {
    console.log("Key pressed:", event.key);

    // Example: Delete key to remove all nodes
    if (event.key === "Delete") {
      // setNodes([]);
    }

    // Example: Ctrl + D to duplicate selected node (placeholder)
    if (event.ctrlKey && event.key === "d") {
      event.preventDefault();
      console.log("Duplicate action triggered");
    }
  };

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  const deleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdgeIds = new Set(selectedEdges.map((e) => e.id));
    const hasSelection = selectedNodeIds.size > 0 || selectedEdgeIds.size > 0;
    if (!hasSelection) return;

    if (selectedNodeIds.size > 0) {
      setNodes((nds) => nds.filter((n) => !selectedNodeIds.has(n.id)));
    }
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !selectedEdgeIds.has(e.id) &&
          !selectedNodeIds.has(e.source) &&
          !selectedNodeIds.has(e.target)
      )
    );
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  const addNewNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      type: 'textUpdater',
      position: { x: 100 + (nodes.length % 5) * 80, y: 100 + Math.floor(nodes.length / 5) * 80 },
      data: { label: 'New node' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  const performDelete = useCallback(async (nameToDelete) => {
    const response = await fetch(`http://localhost:3000/map/delete/${encodeURIComponent(nameToDelete)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setSelectedNodes([]);
    setSelectedEdges([]);
    setDeleteConfirmName(null);
    window.location.reload();
  }, []);

  const handleDeleteRequest = useCallback((nameToDelete) => {
    setDeleteConfirmName(nameToDelete);
  }, []);

  const handleItemClick = useCallback(async (item) => {
    try {
      // Store the selected map name in localStorage
      localStorage.setItem('name', item);

      // Fetch the map data using POST request
      const response = await fetch('http://localhost:3000/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: item })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }

      const data = await response.json();

      if (data && data.nodes && data.edges) {
        setName(item);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
      const newNode = {
        id: `${nodes.length + 1}`,
        type: 'textUpdater',
        position: { x: 100, y: 100 },
        data: { label: item },
      };
      setNodes((nds) => [...nds, newNode]);
    }
  }, [nodes.length]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SimpleBezier },
          eds,
        ),
      ),
    [],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  const handleMouseMove = useCallback((event) => {
    const { clientX, clientY } = event;
    const cursorPos = { x: clientX, y: clientY };

    setCursorPos(cursorPos);
    // console.log("Flow canvas position:", cursorPos); // 👈 This is what you want
  });

  // Final position after drag stops
  const onNodeDragStop = useCallback((event, node) => {
    console.log(`Node ${node.id} stopped at:`, node.position);
    // You could save to state/localStorage/API here
    // setNodes((nds) =>
    //   nds.map((n) =>
    //     n.id === node.id ? { ...n, position: node.position } : n
    //   )
    // );
  }, []);

  const AlgoChange = useCallback((algo) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      'elk.algorithm': algo
    }));
    // Apply new layout immediately after updating config
    return getLayoutedElements({
      ...config,
      'elk.algorithm': algo
    });
  }, [getLayoutedElements]);

  const directionChange = useCallback((direction) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      'elk.direction': direction
    }));
    // Apply new layout immediately after updating config
    return getLayoutedElements({
      ...config,
      'elk.direction': direction
    });
  }, [getLayoutedElements]);

  const deleteProperty = (propertyToDelete) => {
    setConfig(prevObject => {
      // Create a new object without the property to delete
      const { [propertyToDelete]: _, ...rest } = prevObject;
      return rest;
    });
  };

  const onNodeClick = useCallback((event, node) => {
    // Target section = nodes this node connects TO (use graph)
    let targetNodeIds = graph.bfs(node.id,'successors');
    if( !showNodes){
      targetNodeIds = [];
    }
    const idsToToggle = [...targetNodeIds];

    let isCurrentlyHidden = node.hidden;
    if( idsToToggle.length > 0){
      let neighborId = idsToToggle[0];
      isCurrentlyHidden = nodes.find(n => n.id === neighborId)?.hidden;
    }

    // const isCurrentlyHidden = node.hidden === true;
    setNodes((nds) =>
      nds.map((n) =>
        idsToToggle.includes(n.id)
          ? { ...n, hidden: !isCurrentlyHidden }
          : n
      )
    );
    setEdges((eds) =>
      eds.map((e) => {
        const sourceInGroup = idsToToggle.includes(e.source);
        const targetInGroup = idsToToggle.includes(e.target);
        if (sourceInGroup || targetInGroup) {
          return { ...e, hidden: !isCurrentlyHidden };
        }
        return e;
      })
    );
  }, [graph, setNodes, setEdges]);

  return (
    <>
      {deleteConfirmName !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirmName(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              minWidth: '320px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: '0 0 20px', fontSize: '16px' }}>
              Do you want to delete this Graph?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmName(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => performDelete(deleteConfirmName)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#c00',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", height: "100vh" }}>
        <SideBar onItemClick={handleItemClick} handleDelete={handleDeleteRequest} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          colorMode={colorMode}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          connectionLineType={ConnectionLineType.SmoothStep}
          onSelectionChange={onSelectionChange}
          onMouseMove={handleMouseMove}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={(event, node) => {
            console.log('Node double-clicked:', node);
            // Add your double-click logic here
          }}
          fitView
          style={{ backgroundColor: "black" }}
          selectionKeyCode="Shift"
          selectionOnDrag
          multiSelectionKeyCode="Control"
          deleteKeyCode="Backspace"
        >
          <Panel position="top-left"
            style={{
              gap: '8px',
              padding: '10px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(11, 10, 10, 0.17)',
              zIndex: 5
            }}>
            {/* <AlgoButton onClick={directionChange} algorithm='AUTOMATIC' buttonStyle={buttonStyle}>AUTOMATIC</AlgoButton>  */}
            <AlgoButton onClick={directionChange} algorithm='TOP' buttonStyle={buttonStyle}>TOP</AlgoButton>
            <AlgoButton onClick={directionChange} algorithm='RIGHT' buttonStyle={buttonStyle}>RIGHT</AlgoButton>
            <AlgoButton onClick={directionChange} algorithm='DOWN' buttonStyle={buttonStyle}>DOWN</AlgoButton>
            <AlgoButton onClick={directionChange} algorithm='LEFT' buttonStyle={buttonStyle}>LEFT</AlgoButton>
            <AlgoButton onClick={directionChange} algorithm='CENTER' buttonStyle={buttonStyle}>CENTER</AlgoButton>
            {/* <AlgoButton onClick={()=> deleteProperty('elk.direction')} algorithm='CENTER' buttonStyle={buttonStyle}>NO DIRECTION</AlgoButton> */}
            <button onClick={() => saveNodes(nodes, edges)} style={buttonStyle}>Save Positions</button>
            <button
              onClick={deleteSelected}
              disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
              style={{
                ...buttonStyle,
                opacity: selectedNodes.length === 0 && selectedEdges.length === 0 ? 0.5 : 1,
                cursor: selectedNodes.length === 0 && selectedEdges.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Delete selected ({selectedNodes.length + selectedEdges.length})
            </button>
            <button onClick={addNewNode} style={buttonStyle}>Add node</button>
            <button onClick={() => setIsAddModalOpen(!isAddModalOpen)} style={buttonStyle}>Add New Nodes</button>
            <button
              onClick={() => setShowNodes((on) => !on)}
              style={{
                ...buttonStyle,
                backgroundColor: showNodes ? '#000000' : '#666',
                opacity: showNodes ? 1 : 0.8,
              }}
            >
              Graph {showNodes ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => setIsModalOpen(!isModalOpen)} style={buttonStyle}>Add New Graph</button>
            <FileUploadModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleAddSubmit}
            />
            <FileUploadModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmit}
            />
            {saveStatus && ( 
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '10px',
                backgroundColor: saveStatus.includes('Error') ? '#f44336' : '#4CAF50',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {saveStatus}
              </div>
            )}
          </Panel>
          <Panel position="top-right"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 5
            }}>
            {/* <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.box' buttonStyle={buttonStyle} >ELK Box</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.disco' buttonStyle={buttonStyle} >ELK Disco</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.fixed' buttonStyle={buttonStyle} > ELK Fixed</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.force' buttonStyle={buttonStyle} > ELK Force</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.layered' buttonStyle={buttonStyle} >ELK Layered</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.mrtree' buttonStyle={buttonStyle} >ELK Mr. Tree</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.radial' buttonStyle={buttonStyle} >ELK Radial</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.random' buttonStyle={buttonStyle} > ELK Randomizer</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.rectpacking' buttonStyle={buttonStyle} >ELK Rectangle Packing</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.sporeCompaction' buttonStyle={buttonStyle} >ELK Spore Compaction</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.sporeOverlap' buttonStyle={buttonStyle} >ELK Spore Overlap Removal</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.stress' buttonStyle={buttonStyle} >ELK Stress</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.topdownpacking' buttonStyle={buttonStyle} >ELK Top-down Packing</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.graphviz.circo' buttonStyle={buttonStyle} >Graphviz Circo</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.graphviz.dot' buttonStyle={buttonStyle} >Graphviz Dot</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.graphviz.fdp' buttonStyle={buttonStyle} >Graphviz Fdp</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.graphviz.neato' buttonStyle={buttonStyle} >Graphviz Neato</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.graphviz.twopi' buttonStyle={buttonStyle} >Graphviz Twopi</AlgoButton>
            <AlgoButton onClick={AlgoChange} algorithm='org.eclipse.elk.alg.libavoid' buttonStyle={buttonStyle} >Libavoid</AlgoButton> */}

          </Panel>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </>
  );
};

export function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}