import Button from '@mui/material/Button';
import {Background, Controls, MarkerType, Position, ReactFlow} from "reactflow";
import "reactflow/dist/style.css";
import {Chip} from "@mui/material";
import PlanNode from '../CustomNode/PlanNode';
import UnitNode from '../CustomNode/UnitNode';

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
        uNode: UnitNode,
    };

    const defaultNodes = [
        {
            id: 'U1',
            position: {x: -200, y: 70},
            data: {label: 'Unit1'},
            type: 'input',
            sourcePosition: Position.Right,
        },
        {
            id: 'U3',
            position: {x: 600, y: 70},
            data: {label: 'Unit3'},
            type: 'output',
            targetPosition: Position.Left,
        },
        {
            id: 'U2',
                position: {x: 200, y: 60},
            data: {label: 'Unit2'},
            type: 'uNode',
            style: {
                background: '#D6D5E6',
                color: '#333',
                border: '1px solid #222138',
            },
        },
        {
            id: 'A1',
            position: {x: 120, y: 350},
            data: {label: 'AGENT1'},
            type: 'input',
        },
        {
            id: 'A2',
            position: {x: 370, y: 330},
            data: {label: 'AGENT2'},
            type: 'input',
        },
        {
            id: 'G1',
            position: {x: 50, y: 450},
            data: {label: 'Goal1'},
            sourcePosition: Position.Left,
        },
        {
            id: 'G2',
            position: {x: 440, y: 450},
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
            position: {x: 400, y: 200},
            data: {label: 'Plan2'},
            targetPosition: Position.Bottom,
        },
        {
            id: 'V1',
            position: {x: 190, y: 460},
            data: {label: 'Value11\nValue12'},
        },
        {
            id: 'V2',
            position: {x: 310, y: 450},
            data: {label: 'Value21\nValue22'},
        },
        {
            id: 'E1',
            position: {x: 120, y: 530},
            data: {label: 'Emotion11\nEmotion12'},
        },
        {
            id: 'E2',
            position: {x: 380, y: 530},
            data: {label: 'Emotion21\nEmotion22'},
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
            id: 'U1->U2',
            source: 'U1',
            target: 'U2',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'precedes/follows',
        },
        {
            id: 'U2->U3',
            source: 'U2',
            target: 'U3',
            sourceHandle: 'u_s_r',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'precedes/follows',
        },
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
            id: 'P1->P2_conflict',
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
            id: 'P1->P2_support',
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
            id: 'U2->P1',
            source: 'U2',
            target: 'P1',
            targetHandle: 'p_t_s',
            type: 'smoothstep',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            label: 'hasMotivation/isMotivationFor',
        },
        {
            id: 'U2->P2',
            source: 'U2',
            target: 'P2',
            targetHandle: 'p_t_s',
            type: 'smoothstep',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            label: 'hasMotivation/\nisMotivationFor',
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
        },
        {
            id: 'A1->E1',
            source: 'A1',
            target: 'E1',
            markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
                color: '#1f39e1',

            },
            label: 'feels',
            animated: true,
            style: {
                strokeWidth: 2,
                stroke: '#1f39e1',
            },
        },
        {
            id: 'A2->E2',
            source: 'A2',
            target: 'E2',
            markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
                color: '#1f39e1',
            },
            label: 'feels',
            animated: true,
            style: {
                strokeWidth: 2,
                stroke: '#1f39e1',
            },
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
                    fitView
                    elementsSelectable={true}
                    nodesConnectable={false}
                    nodesDraggable={true}>
                    <Controls showInteractive={false} />
                    <Background />
                </ReactFlow>
            </div>
        </>
    );
}

export default Home;