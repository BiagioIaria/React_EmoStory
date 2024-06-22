import Button from '@mui/material/Button';
import {Background, Controls, MarkerType, Position, ReactFlow} from "reactflow";
import "reactflow/dist/style.css";
import {Chip} from "@mui/material";
import PlanNode from '../CustomNode/PlanNode';

const upload_file = (
    <Button
        variant="contained"
        component="label"
    >
        Upload File

        <input
            type="file"
            hidden
            onChange={(event) => {
                const file = event.target.files![0];
                console.log(file);
                const reader = new FileReader();
                reader.onload = function (e) {
                    console.log(e.target!.result);
                };
                reader.readAsText(file);
            }}
        />
    </Button>)

const unit = Unit()

function Home() {

    return (
        <>
        {upload_file}
        {unit}
        </>
    );
}

function Unit() {
    const nodeTypes = {
        pNode: PlanNode,
    };

    const defaultNodes = [
        {
            id: 'A1',
            position: {x: 120, y: 350},
            data: {label: 'AGENT1'},
            style: {}
        },
        {
            id: 'A2',
            position: {x: 270, y: 330},
            data: {label: 'AGENT2'},
            style: {}
        },
        {
            id: 'G1',
            position: {x: 50, y: 450},
            data: {label: 'Goal1'},
            sourcePosition: Position.Left,
        },
        {
            id: 'G2',
            position: {x: 340, y: 450},
            data: {label: 'Goal2'},
            sourcePosition: Position.Right
        },
        {
            id: 'P1',
            type: 'pNode',
            position: {x: 0, y: 250},
            data: {label: 'Plan1'},
            targetPosition: Position.Bottom,
        },
        {
            id: 'P2',
            type: 'pNode',
            position: {x: 300, y: 200},
            data: {label: 'Plan2'},
            targetPosition: Position.Bottom,
        },
        {
            id: 'V1',
            position: {x: 120, y: 500},
            data: {label: 'Value11\nValue12'},
        },
        {
            id: 'V2',
            position: {x: 280, y: 500},
            data: {label: 'Value21\nValue22'},
        }
    ];

    const updatedNodes = defaultNodes.map((node) => ({
        ...node,
        style: {
            ...node.style,
            width: 100,
            height: '40pe',
        },
    }));

    const defaultEdges = [
        {
            id: 'A1->G1',
            source: 'A1',
            target: 'G1',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasGoal',
        },
        {
            id: 'A2->G2',
            source: 'A2',
            target: 'G2',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasGoal',
        },
        {
            id: 'G1->P1',
            source: 'G1',
            target: 'P1',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            label: 'achieves/isAchievedBy',
        },
        {
            id: 'G2->P2',
            source: 'G2',
            target: 'P2',
            targetHandle: 'p_t_a',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            label: 'achieves/isAchievedBy',
        },
        {
            id: 'P1->P2',
            source: 'P1',
            target: 'P2',
            sourceHandle: 'p_s_c',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            markerStart: {
                type: MarkerType.ArrowClosed,
            },
            label: 'conflict',
        },
        {
            id: 'P1->P2',
            source: 'P1',
            target: 'P2',
            sourceHandle: 'p_s_s',
            targetHandle: 'p_t_s',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            markerStart: {
                type: MarkerType.ArrowClosed,
            },
            label: 'support',
        },
        {
            id: 'A1->V1',
            source: 'A1',
            target: 'V1',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasValue',
        },
        {
            id: 'A2->V2',
            source: 'A2',
            target: 'V2',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasValue',
        }
    ];

    const proOptions = { hideAttribution: true };

    return (
        <>
            <div style={{textAlign: "center", marginBottom: 4}}>
                <Chip label="Unit Hierarchy" color={"info"}/>
            </div>
            <div className='ReactFlow' style={{ height: 1000, width: '75%', margin: 'auto', border: '2px solid black', marginBottom: 10}}>
                <ReactFlow
                    defaultNodes={updatedNodes}
                    defaultEdges={defaultEdges}
                    proOptions={proOptions}
                    nodeTypes={nodeTypes}
                    fitView>
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </>
    );
}

export default Home;