import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';

function TextUpdaterNode({ id, data, isConnectable }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data?.label ?? '');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { setNodes } = useReactFlow();

  const label = data?.label ?? '';

  const startEditing = useCallback(() => {
    setDraftLabel(label);
    setIsEditing(true);
  }, [label]);

  const saveLabel = useCallback(() => {
    const value = (draftLabel ?? '').trim();
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: value || (node.data?.label ?? '') } }
          : node
      )
    );
    setIsEditing(false);
  }, [id, draftLabel, setNodes]);

  const handleKeyDown = useCallback(
    (evt) => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        evt.preventDefault();
        saveLabel();
      }
      if (evt.key === 'Escape') {
        setDraftLabel(label);
        setIsEditing(false);
        inputRef.current?.blur();
      }
    },
    [saveLabel, label]
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [isEditing]);

  const adjustTextareaSize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.overflow = 'hidden';
    el.style.height = '0';
    el.style.width = '0';
    const newHeight = Math.max(el.scrollHeight, 24);
    const newWidth = Math.max(el.scrollWidth, 100);
    el.style.width = `${newWidth}px`;
    el.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    if (isEditing) adjustTextareaSize();
  }, [isEditing, draftLabel, adjustTextareaSize]);

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
          border: '1px solid #333',
          borderRadius: '6px',
          color: '#eee',
          fontSize: '12px',
        }}
        onDoubleClick={startEditing}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={draftLabel}
            onChange={(e) => {
              setDraftLabel(e.target.value);
              setTimeout(adjustTextareaSize, 0);
            }}
            onBlur={saveLabel}
            onKeyDown={handleKeyDown}
            style={{
              minWidth: '100px',
              minHeight: '24px',
              overflow: 'hidden',
              background: '#0f0f1a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#eee',
              padding: '6px',
              fontSize: '12px',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              whiteSpace: 'pre',
              display: 'block',
            }}
            wrap="off"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <code style={{ whiteSpace: 'pre', display: 'block' }}>
            {label || 'Double-click to edit'}
          </code>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}

export default TextUpdaterNode;
