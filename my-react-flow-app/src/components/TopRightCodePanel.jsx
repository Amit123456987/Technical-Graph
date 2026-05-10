import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@xyflow/react';

const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '10px',
  background: '#0a0a0a',
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
  background: '#090909',
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
  background: '#090909',
};

const lineNumberGutterStyle = {
  padding: '5px 4px',
  background: '#050505',
  color: '#9ca3af',
  borderRight: '1px solid #374151',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  fontSize: '12px',
  lineHeight: 1.4,
  textAlign: 'right',
  userSelect: 'none',
};

const saveButtonStyle = {
  background: '#111111',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  alignSelf: 'flex-start',
};

const codeCopyButtonStyle = {
  position: 'absolute',
  top: '6px',
  right: '6px',
  background: '#1f2937',
  color: '#e5e7eb',
  border: '1px solid #374151',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 600,
  zIndex: 1,
  lineHeight: 1.2,
};

const labelTextareaStyle = {
  width: '100%',
  minHeight: '70px',
  resize: 'vertical',
  background: '#050505',
  color: '#f9fafb',
  border: '1px solidrgb(0, 0, 0)',
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
  const [labelCopyDone, setLabelCopyDone] = useState(false);
  const [codeCopyDone, setCodeCopyDone] = useState(false);
  const lineCount = Math.max(1, code.split('\n').length);

  const handleCopyLabel = useCallback(async () => {
    if (!selectedNode) return;
    const text = label ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setLabelCopyDone(true);
      window.setTimeout(() => setLabelCopyDone(false), 1500);
    } catch {
      setLabelCopyDone(false);
    }
  }, [label, selectedNode]);

  const handleCopyCode = useCallback(async () => {
    if (!selectedNode) return;
    const text = code ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCodeCopyDone(true);
      window.setTimeout(() => setCodeCopyDone(false), 1500);
    } catch {
      setCodeCopyDone(false);
    }
  }, [code, selectedNode]);

  useEffect(() => {
    setCode((prev) => selectedNode?.data?.code ?? "");
    setLabel((prev) => selectedNode?.data?.label ?? "");
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
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          spellCheck={false}
          style={{
            ...labelTextareaStyle,
            paddingRight: '52px',
            borderColor: selectedNode ? '#444444' : '#334155',
            boxShadow: selectedNode ? '0 0 0 1px rgba(255,255,255,0.2)' : 'none',
            opacity: selectedNode ? 1 : 0.6,
            cursor: selectedNode ? 'text' : 'not-allowed',
          }}
          placeholder="Select a node to edit label..."
          disabled={!selectedNode}
        />
        <button
          type="button"
          style={{
            ...codeCopyButtonStyle,
            opacity: selectedNode ? 1 : 0.45,
            cursor: selectedNode ? 'pointer' : 'not-allowed',
          }}
          onClick={handleCopyLabel}
          disabled={!selectedNode}
          title="Copy label to clipboard"
        >
          {labelCopyDone ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={editorWrapperStyle}>
        <div style={lineNumberGutterStyle} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx + 1}>{idx + 1}</div>
          ))}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              ...editorStyle,
              paddingRight: '52px',
            }}
            placeholder="Select a node to edit code..."
            disabled={!selectedNode}
          />
          <button
            type="button"
            style={{
              ...codeCopyButtonStyle,
              opacity: selectedNode ? 1 : 0.45,
              cursor: selectedNode ? 'pointer' : 'not-allowed',
            }}
            onClick={handleCopyCode}
            disabled={!selectedNode}
            title="Copy code to clipboard"
          >
            {codeCopyDone ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </Panel>
  );
});

export default TopRightCodePanel;
