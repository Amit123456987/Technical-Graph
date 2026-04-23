import React from 'react';
import { Handle, Position } from '@xyflow/react';

function TextUpdaterNode({ id, data, isConnectable }) {
  const label = data?.label ?? '';

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 'fit-content',
        minWidth: '120px',
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div
        style={{
          padding: '8px 12px',
          minWidth: '120px',
          minHeight: '40px',
          width: 'fit-content',
          background: '#1a1a2e',
          color: '#eee',
          fontSize: '12px',
        }}
      >        
        {label || 'Untitled node'}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}

export default TextUpdaterNode;
