import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// @ts-ignore
export default memo(({ data }) => {
    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ pointerEvents: 'none' }}
            />
            <Handle
                type="target"
                position={Position.Right}
                id='p_t_a'
                style={{ pointerEvents: 'none' }}
            />
            <Handle
                type="target"
                position={Position.Top}
                id='p_t_s'
                style={{ pointerEvents: 'none' }}
            />
            <p style={{textAlign:"center", marginTop: "0.5em"}}>
                {data.label}
            </p>
            <div style={{textAlign:"center", fontSize: '7pt', backgroundColor: '#13ff02'}}>
                accomplished
            </div>
            <div style={{textAlign:"center", fontSize: '7pt', backgroundColor: '#ff0000'}}>
                unaccomplished
            </div>
            <Handle
                type="source"
                position={Position.Top}
                id='p_s_s'
                style={{ pointerEvents: 'none' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id='p_s_c'
                style={{ pointerEvents: 'none' }}
            />
        </>
    );
});
