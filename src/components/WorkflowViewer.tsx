'use client';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Node, Edge } from '@xyflow/react';

interface WorkflowViewerProps {
  nodes: Node[];
  edges: Edge[];
}

export default function WorkflowViewer({ nodes, edges }: WorkflowViewerProps) {
  return (
    <div style={{ height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
