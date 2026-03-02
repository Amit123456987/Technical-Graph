import { BaseEdge, getBezierPath, getSimpleBezierPath, getSmoothStepPath, getStraightPath } from '@xyflow/react';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, label }) => {
  const [edgePath] =  getStraightPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <text
        x={(sourceX + targetX) / 2}
        y={(sourceY + targetY) / 2}
        fill="black"
        fontSize={12}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {label}
      </text>
    </>
  );
};


export default CustomEdge;