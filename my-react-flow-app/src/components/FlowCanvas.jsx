import React from 'react';
import {
  ReactFlow,
  ConnectionLineType,
  MiniMap,
  Background,
  Controls,
} from '@xyflow/react';
import FlowControlPanel from './FlowControlPanel';
import TopRightCodePanel from './TopRightCodePanel';

function FlowCanvas({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  colorMode,
  onReconnect,
  onReconnectStart,
  onReconnectEnd,
  onSelectionChange,
  handleMouseMove,
  onNodeDragStop,
  onNodeClick,
  buttonStyle,
  directionChange,
  saveNodes,
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
  selectedNodes,
  setNodes,
}) {
  return (
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
      onNodeDoubleClick={(_, node) => {
        console.log('Node double-clicked:', node);
      }}
      fitView
      style={{ backgroundColor: 'black' }}
      selectionKeyCode="Shift"
      selectionOnDrag
      multiSelectionKeyCode="Control"
      deleteKeyCode="Backspace"
    >
      <FlowControlPanel
        buttonStyle={buttonStyle}
        directionChange={directionChange}
        saveNodes={saveNodes}
        nodes={nodes}
        edges={edges}
        requestDeleteSelection={requestDeleteSelection}
        selectedNodesCount={selectedNodesCount}
        selectedEdgesCount={selectedEdgesCount}
        addNewNode={addNewNode}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleAddSubmit={handleAddSubmit}
        showNodes={showNodes}
        setShowNodes={setShowNodes}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleSubmit={handleSubmit}
        saveStatus={saveStatus}
      />

      <TopRightCodePanel
        selectedNodes={selectedNodes}
        setNodes={setNodes}
        nodes={nodes}
        edges={edges}
        saveNodes={saveNodes}
      />
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
}

export default FlowCanvas;
