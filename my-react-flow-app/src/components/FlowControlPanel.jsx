import React from 'react';
import { Panel } from '@xyflow/react';
import AlgoButton from './Button';
import FileUploadModal from '../FileUploadModal';

const panelStyle = {
  gap: '8px',
  padding: '10px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(11, 10, 10, 0.17)',
  zIndex: 5,
};

function FlowControlPanel({
  buttonStyle,
  directionChange,
  saveNodes,
  nodes,
  edges,
  requestDeleteSelection,
  selectedNodesCount,
  selectedEdgesCount,
  addNewNode,
  isAddModalOpen,
  setIsAddModalOpen,
  handleAddSubmit,
  showNodes,
  setShowNodes,
  isModalOpen,
  setIsModalOpen,
  handleSubmit,
  saveStatus,
}) {
  const noSelection = selectedNodesCount === 0 && selectedEdgesCount === 0;

  return (
    <Panel position="top-left" style={panelStyle}>
      <AlgoButton onClick={directionChange} algorithm="TOP" buttonStyle={buttonStyle}>TOP</AlgoButton>
      <AlgoButton onClick={directionChange} algorithm="RIGHT" buttonStyle={buttonStyle}>RIGHT</AlgoButton>
      <AlgoButton onClick={directionChange} algorithm="DOWN" buttonStyle={buttonStyle}>DOWN</AlgoButton>
      <AlgoButton onClick={directionChange} algorithm="LEFT" buttonStyle={buttonStyle}>LEFT</AlgoButton>
      <AlgoButton onClick={directionChange} algorithm="CENTER" buttonStyle={buttonStyle}>CENTER</AlgoButton>

      <button type="button" onClick={() => saveNodes(nodes, edges)} style={buttonStyle}>Save Positions</button>
      <button
        type="button"
        onClick={requestDeleteSelection}
        disabled={noSelection}
        style={{
          ...buttonStyle,
          opacity: noSelection ? 0.5 : 1,
          cursor: noSelection ? 'not-allowed' : 'pointer',
        }}
      >
        Delete selected ({selectedNodesCount + selectedEdgesCount})
      </button>
      <button type="button" onClick={addNewNode} style={buttonStyle}>Add node</button>
      <button type="button" onClick={() => setIsAddModalOpen(!isAddModalOpen)} style={buttonStyle}>Add New Nodes</button>
      <button
        type="button"
        onClick={() => setShowNodes((on) => !on)}
        style={{
          ...buttonStyle,
          backgroundColor: showNodes ? '#000000' : '#666',
          opacity: showNodes ? 1 : 0.8,
        }}
      >
        Graph {showNodes ? 'ON' : 'OFF'}
      </button>
      <button type="button" onClick={() => setIsModalOpen(!isModalOpen)} style={buttonStyle}>Add New Graph</button>

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
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            backgroundColor: saveStatus.includes('Error') ? '#f44336' : '#4CAF50',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {saveStatus}
        </div>
      )}
    </Panel>
  );
}

export default FlowControlPanel;
