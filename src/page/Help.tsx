import {Background, Controls, MarkerType, Position, ReactFlow} from "reactflow";
import "reactflow/dist/style.css";
import {Chip} from "@mui/material";
import PlanNode from '../CustomNodeEdge/PlanNode';
import UnitNode from '../CustomNodeEdge/UnitNode';
import CustomEndEdge from '../CustomNodeEdge/CustomEndEdge';

const unit = Unit()

function Help() {

    return (
        <>
        {unit}
        </>
    );
}

function Unit() {
    const nodeTypes = {
        pNode: PlanNode,
        uNode: UnitNode,
    };

    const edgeTypes = {
        endEdge: CustomEndEdge,
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
            position: {x: 470, y: 280},
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
            position: {x: 540, y: 450},
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
            position: {x: 500, y: 200},
            data: {label: 'Plan2'},
            targetPosition: Position.Bottom,
        },
        {
            id: 'PSP1',
            position: {x: 260, y: 380},
            data: {label: 'Possible SuperPlan1\n(Hierarchically higher)'},
            type: 'output',
            targetPosition: Position.Left,
            style: {
                border: 'none'
            }
        },
        {
            id: 'PSP2',
            position: {x: 300, y: 330},
            data: {label: 'Possible SuperPlan2\n(Hierarchically higher)'},
            type: 'output',
            targetPosition: Position.Right,
            style: {
                border: 'none',
            }
        },
        {
            id: 'V1',
            position: {x: 190, y: 460},
            data: {label: 'Value11\nValue12'},
        },
        {
            id: 'V2',
            position: {x: 410, y: 450},
            data: {label: 'Value21\nValue22'},
        },
        {
            id: 'E1',
            position: {x: 120, y: 550},
            data: {label: 'Emotion11\nEmotion12'},
        },
        {
            id: 'E2',
            position: {x: 480, y: 550},
            data: {label: 'Emotion21\nEmotion22'},
        },
        {
            id: 'PU2',
            position: {x: -200, y: 130},
            data: {label: 'Consistent State Set\nPre Unit 2'},
            sourcePosition: Position.Right,
            targetPosition: Position.Bottom
        },
        {
            id: 'PP2',
            position: {x: -300, y: 300},
            data: {label: 'Consistent State Set\nPre Plan 2'},
            sourcePosition: Position.Right,
            targetPosition: Position.Bottom
        },
        {
            id: 'EU2',
            position: {x: 700, y: 130},
            data: {label: 'Consistent State Set\nEff Unit 2'},
            targetPosition: Position.Bottom
        },
        {
            id: 'EP2',
            position: {x: 800, y: 300},
            data: {label: 'Consistent State Set\nEff Plan 2'},
            targetPosition: Position.Bottom
        }
    ];

    const updatedNodes = defaultNodes.map((node) => {
        if (node.id === 'PSP1' || node.id === 'PSP2') {
            return node;
        }

        return {
            ...node,
            style: {
                ...node.style,
                width: 100,
            },
        };
    });

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
            label: 'hasMotivation/isMotivationFor',
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
        },
        {
            id: 'PU2->U2',
            source: 'PU2',
            target: 'U2',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasPrecondition/ IsPreconditionOf',
        },
        {
            id: 'P2->EP2',
            source: 'P2',
            target: 'EP2',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasPrecondition/ IsPreconditionOf',
        },
        {
            id: 'V1->PU2',
            source: 'V1',
            target: 'PU2',
            type: 'endEdge',
            data: {
                endLabel1: 'atStake',
                endLabel2: 'inBalance'
            }
        },
        {
            id: 'V1->PP2',
            source: 'V1',
            target: 'PP2',
            type: 'endEdge',
            data: {
                endLabel1: 'atStake',
                endLabel2: 'inBalance'
            }
        },
        {
            id: 'PP2->P1',
            source: 'PP2',
            target: 'P1',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'hasPrecondition / isPreconditionOf',
        },
        {
            id: 'V1->EU2',
            source: 'V1',
            target: 'EU2',
            type: 'endEdge',
            data: {
                endLabel1: 'atStake',
                endLabel2: 'inBalance',
                color: '#0924f6'
            },
            animated: true,
        },
        {
            id: 'V2->EU2',
            source: 'V2',
            target: 'EU2',
            type: 'endEdge',
            data: {
                endLabel1: 'atStake',
                endLabel2: 'inBalance',
                color: '#0924f6'
            },
            animated: true,
        },
        {
            id: 'V2->EP2',
            source: 'V2',
            target: 'EP2',
            type: 'endEdge',
            data: {
                endLabel1: 'atStake',
                endLabel2: 'inBalance'
            }
        },
        {
            id: 'E2->EU2',
            source: 'E2',
            target: 'EU2',
            type: 'smoothstep',
        },
        {
            id: 'E1->EU2',
            source: 'E1',
            target: 'EU2',
            type: 'smoothstep',
        },
        {
            id: 'A1->PSP1',
            source: 'A1',
            target: 'PSP1',
            label: 'intends',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
        },
        {
            id: 'A2->PSP2',
            source: 'A2',
            target: 'PSP2',
            label: 'intends',
            markerEnd: {
                type: MarkerType.ArrowClosed,
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
                    edgeTypes={edgeTypes}
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

export default Help;