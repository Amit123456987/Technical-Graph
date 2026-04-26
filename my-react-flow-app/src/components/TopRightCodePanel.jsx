import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@xyflow/react';

const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '10px',
  background: '#111827',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  zIndex: 5,
  width: '360px',
};

const editorStyle = {
  width: '100%',
  minHeight: '220px',
  maxHeight: '320px',
  resize: 'vertical',
  background: '#0b1220',
  color: '#e5e7eb',
  border: 'none',
  borderRadius: 0,
  padding: '5px',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  fontSize: '12px',
  lineHeight: 1.4,
  outline: 'none',
};

const editorWrapperStyle = {
  display: 'flex',
  border: '1px solid #374151',
  borderRadius: '6px',
  overflow: 'hidden',
  background: '#0b1220',
};

const lineNumberGutterStyle = {
  padding: '5px 4px',
  background: '#0f172a',
  color: '#9ca3af',
  borderRight: '1px solid #374151',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  fontSize: '12px',
  lineHeight: 1.4,
  textAlign: 'right',
  userSelect: 'none',
};

const saveButtonStyle = {
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  alignSelf: 'flex-start',
};

const labelTextareaStyle = {
  width: '100%',
  minHeight: '70px',
  resize: 'vertical',
  background: '#0f172a',
  color: '#f9fafb',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '10px 12px',
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontSize: '13px',
  lineHeight: 1.5,
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const TopRightCodePanel = React.memo(({ selectedNodes, setNodes, nodes, edges, saveNodes }) => {
  const selectedNode = selectedNodes[0];
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const lineCount = Math.max(1, code.split('\n').length);

  useEffect(() => {
    setCode(selectedNode?.data?.code ?? '');
    setLabel(selectedNode?.data?.label ?? '');
  }, [selectedNode?.id, selectedNode?.data?.code, selectedNode?.data?.label]);

  const handleSave = useCallback(() => {
    if (!selectedNode?.id) return;

    const updatedNodes = nodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                code,
                label,
              },
            }
          : node
      );

    setNodes(updatedNodes);
    saveNodes(updatedNodes, edges);
  }, [code, selectedNode?.id, nodes, edges, setNodes, saveNodes]);

  return (
    <Panel position="top-right" style={panelStyle}>
      <div style={{ color: '#f9fafb', fontSize: '13px', fontWeight: 600 }}>
        Code Canvas
      </div>
      <button
        type="button"
        style={saveButtonStyle}
        onClick={handleSave}
        disabled={!selectedNode}
      >
        Save
      </button>
      <div>
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          spellCheck={false}
          style={{
            ...labelTextareaStyle,
            borderColor: selectedNode ? '#3b82f6' : '#334155',
            boxShadow: selectedNode ? '0 0 0 1px rgba(59,130,246,0.35)' : 'none',
            opacity: selectedNode ? 1 : 0.6,
            cursor: selectedNode ? 'text' : 'not-allowed',
          }}
          placeholder="Select a node to edit label..."
          disabled={!selectedNode}
        />
      </div>
      <div style={editorWrapperStyle}>
        <div style={lineNumberGutterStyle} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx + 1}>{idx + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={editorStyle}
          placeholder="Select a node to edit code..."
          disabled={!selectedNode}
        />
      </div>
    </Panel>
  );
});

export default TopRightCodePanel;
