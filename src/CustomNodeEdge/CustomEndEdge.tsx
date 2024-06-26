import React, { FC } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

function EdgeLabel({ transform1, transform2, label1, label2 }: { transform1: string; transform2: string; label1: string; label2: string }) {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    background: '#ff0000',
                    fontSize: 12,
                    fontWeight: 700,
                    transform: transform1,
                }}
                className="nodrag nopan"
            >
                {label1}
            </div>
            <div
                style={{
                    position: 'absolute',
                    background: '#13ff02',
                    fontSize: 12,
                    fontWeight: 700,
                    transform: transform2,
                }}
                className="nodrag nopan"
            >
                {label2}
            </div>
        </>
    );
}

const CustomEdge: FC<EdgeProps> = ({
                                       id,
                                       sourceX,
                                       sourceY,
                                       targetX,
                                       targetY,
                                       sourcePosition,
                                       targetPosition,
                                       data,
                                   }) => {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 10,
    });

    const edgeColor = data.color || '#7a7a7a';

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd="url(#arrowhead)" style={{ stroke: edgeColor }} />
            <EdgeLabelRenderer>
                {data.endLabel1 && data.endLabel2 && (
                    <EdgeLabel
                        transform1={`translate(10%, 50%) translate(${targetX}px,${targetY}px)`}
                        transform2={`translate(10%, 150%) translate(${targetX}px,${targetY}px)`}
                        label1={data.endLabel1}
                        label2={data.endLabel2}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
};

const ArrowHeadMarker = () => (
    <svg>
        <defs>
            <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="4"
                refX="6"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
            >
                <polygon points="0 0, 6 2, 0 4" fill="#888888" />
            </marker>
        </defs>
    </svg>
);

const CustomEdgeWithMarker: FC<EdgeProps> = (props) => (
    <>
        <ArrowHeadMarker />
        <CustomEdge {...props} />
    </>
);

export default CustomEdgeWithMarker;
