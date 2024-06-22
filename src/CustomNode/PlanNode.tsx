import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// @ts-ignore
export default memo(({ data }) => {
    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
            />
            <Handle
                type="target"
                position={Position.Right}
                id='p_t_a'
            />
            <Handle
                type="target"
                position={Position.Top}
                id='p_t_s'
            />
            <p style={{textAlign:"center", marginTop: "0.5em"}}>
                {data.label}
            </p>
            <Handle
                type="source"
                position={Position.Top}
                id='p_s_s'
            />
            <Handle
                type="source"
                position={Position.Right}
                id='p_s_c'
            />
        </>
    );
});
