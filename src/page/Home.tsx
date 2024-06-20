import Button from '@mui/material/Button';
import {Background, Controls, MarkerType, ReactFlow} from "reactflow";
import "reactflow/dist/style.css";
import {Chip} from "@mui/material";

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
    const defaultNodes = [
        {
            id: 'A',
            position: {x: 20, y: 20},
            data: {label: 'A'},
        },
        {
            id: 'B',
            position: {x: 100, y: 200},
            data: {label: 'B'},
        },
        {
            id: 'C',
            position: {x: 300, y: 20},
            data: {label: 'C'},
        },
        {
            id: 'D',
            position: {x: 300, y: 170},
            data: {label: 'D'},
        },
        {
            id: 'E',
            position: {x: 250, y: 300},
            data: {label: 'E'},
        },
        {
            id: 'F',
            position: {x: 250, y: 450},
            data: {label: 'F'},
        },
        {
            id: 'G',
            position: {x: 20, y: 450},
            data: {label: 'G'},
        },
    ];

    const defaultEdges = [
        {
            id: 'A->B',
            source: 'A',
            target: 'B',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            label: 'default arrow',
        },
        {
            id: 'C->D',
            source: 'C',
            target: 'D',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            label: 'default closed arrow',
        },
        {
            id: 'D->E',
            source: 'D',
            target: 'E',
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            markerStart: {
                type: MarkerType.ArrowClosed,
                orient: 'auto-start-reverse',
            },
            label: 'marker start and marker end',
        },
        {
            id: 'E->F',
            source: 'E',
            target: 'F',
            markerEnd: 'logo',
            label: 'custom marker',
        },
        {
            id: 'B->G',
            source: 'B',
            target: 'G',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#FF0072',
            },
            label: 'marker size and color',
            style: {
                strokeWidth: 2,
                stroke: '#FF0072',
            },
        },
    ];

    const proOptions = { hideAttribution: true };

    return (
        <>
            <div style={{textAlign: "center", marginBottom: 4}}>
                <Chip label="Unit Hierarchy" color={"info"}/>
            </div>
            <div className='ReactFlow' style={{ height: 600, width: '50%', margin: 'auto', border: '2px solid black', marginBottom: 10}}>
                <ReactFlow defaultNodes={defaultNodes} defaultEdges={defaultEdges} proOptions={proOptions} fitView>
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </>
    );
}

export default Home;