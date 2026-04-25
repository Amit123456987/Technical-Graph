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

      <AlgoButton type="button" onClick={() => saveNodes(nodes, edges)} buttonStyle={buttonStyle}>Save Positions</AlgoButton>
      <AlgoButton onClick={requestDeleteSelection} disabled={noSelection} buttonStyle={buttonStyle}>Delete selected ({selectedNodesCount + selectedEdgesCount})</AlgoButton>
      <AlgoButton onClick={addNewNode} buttonStyle={buttonStyle}>Add node</AlgoButton>
      <AlgoButton onClick={() => setIsAddModalOpen(!isAddModalOpen)} buttonStyle={buttonStyle}>Add New Nodes</AlgoButton>
      <AlgoButton onClick={() => setShowNodes((on) => !on)} buttonStyle={buttonStyle}>Graph {showNodes ? 'ON' : 'OFF'}</AlgoButton>
      <AlgoButton onClick={() => setIsModalOpen(!isModalOpen)} buttonStyle={buttonStyle}>Add New Graph</AlgoButton>

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
