import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// @ts-ignore
export default memo(({ data }) => {
    return (
        <>
            <p style={{textAlign: 'center'}}>{data.label}</p>
            <Handle type="source" position={Position.Bottom} id="u_s_b" />
            <Handle type="source" position={Position.Right} id="u_s_r" />
            <Handle type="target" position={Position.Left} id="u_t_r" />
        </>
    );
});
