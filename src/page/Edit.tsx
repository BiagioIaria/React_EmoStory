import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {
    Box,
    IconButton, Menu, MenuItem,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import {useState} from "react";

interface Data {
    [key: string]: string;

    unit_b: string;
    preUnit: string;
    plan1: string;
    unit: string;
    plan2: string;
    effUnit: string;
    unit_n: string;
}

interface ColumnData {
    dataKey: keyof Data;
    label: string;
    width: number;
}

type AnchorEls = {
    [key: string]: HTMLElement | null;
};

type Inputs = {
    [key: string]: {
        input: string;
    };
};

type Sample = [string, string, string, string, string, string, string];

const sampleStandard: readonly Sample[] = [
    ['', '', 'Plans of Agent 1', '', 'Plans of Agent 2', '', ''],
    ['', '', 'Values of Agent 1', '', 'Values of Agent 2', '', ''],
    ['', '', 'Calculated emotions of Agent 1', '', 'Calculated emotions of Agent 2', '', ''],
];

const sampleB: readonly Sample[] = [
    ['Plans of Agent 1', '', '', '', 'Plans of Agent 2', '', ''],
    ['Values of Agent 1', '', '', '', 'Values of Agent 2', '', ''],
    ['Calculated emotions of Agent 1', '', '', '', 'Calculated emotions of Agent 2', '', ''],
];

const sampleN: readonly Sample[] = [
    ['', '', 'Plans of Agent 1', '', '', '', 'Plans of Agent 2'],
    ['', '', 'Values of Agent 1', '', '', '', 'Values of Agent 2'],
    ['', '', 'Calculated emotions of Agent 1', '', '', '', 'Calculated emotions of Agent 2'],
];

function createData(
    unit_b: string,
    preUnit: string,
    plan1: string,
    unit: string,
    plan2: string,
    effUnit: string,
    unit_n: string
): Data {
    return {unit_b, preUnit, plan1, unit, plan2, effUnit, unit_n};
}

const columnWidth = 120;

const initialColumns: ColumnData[] = [
    {
        width: columnWidth,
        label: 'unit i-',
        dataKey: 'unit_b',
    },
    {
        width: columnWidth,
        label: 'Preconditions Unit i',
        dataKey: 'preUnit',
    },
    {
        width: columnWidth,
        label: '',
        dataKey: 'plan1',
    },
    {
        width: columnWidth,
        label: 'unit i',
        dataKey: 'unit',
    },
    {
        width: columnWidth,
        label: '',
        dataKey: 'plan2',
    },
    {
        width: columnWidth,
        label: 'Effects Unit i',
        dataKey: 'effUnit',
    },
    {
        width: columnWidth,
        label: 'Unit i+',
        dataKey: 'unit_n',
    }
];

const initialRows: Data[] = Array.from({length: sampleStandard.length}, (_, index) => {
    const selection = sampleStandard[index];
    return createData(...selection);
});

function Edit() {
    const [groups, setGroups] = useState([3]);
    const [labels, setLabels] = useState({
        plan1: 'P Agent 1 Title',
        plan2: 'P Agent 2 Title'
    });const [anchorEls, setAnchorEls] = useState<AnchorEls>({});
    const [inputs, setInputs] = useState<Inputs>({});
    const handleClick = (event: { currentTarget: any; }, id: any) => {
        setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClose = (id: any) => {
        setAnchorEls((prev) => ({ ...prev, [id]: null }));
    };

    const handleInputChange = (id: string | number, inputName: any, value: any) => {
        setInputs((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [inputName]: value
            }
        }));
    };

    const handleConfirm = (id: any) => {
        if(inputs[id]!==undefined) {
            setLabels(prevLabels => {
                switch (id) {
                    case 'plan1':
                        return {...prevLabels, plan1: inputs[id]['input']};
                    case 'plan2':
                        return {...prevLabels, plan2: inputs[id]['input']};
                    default:
                        return prevLabels;
                }
            });
            handleClose(id);
        }
    };

    const addGroup = (col: any) => {
        groups.pop()
        setGroups([...groups, Number(col[col.length - 1]), 3]);
    };

    const header = () => (
        <TableRow>
            {initialColumns.map((col, index) => (
                <TableCell key={col.dataKey}
                           style={{width: col.width, textAlign: "center"}}
                >{col.label}</TableCell>
            ))}
        </TableRow>
    );

    const rowContent = (rowIndex: number, row: Data) => {
        function ButtonsValue(index: number, column: ColumnData, flag: boolean) {
            if (!flag) {
                return (
                    <Box key={'Value ' + index + ' ' + column.dataKey} position="relative" display="inline-block"
                         margin={1}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" disabled>
                                Balance?
                            </Button>
                            <Button variant="contained" disabled>
                                Value?
                            </Button>
                            <Button variant="contained" disabled>
                                Balance?
                            </Button>
                        </Stack>
                        <IconButton
                            color="primary"
                            aria-label="add"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                            onClick={() => addGroup(column.dataKey)}
                        >
                            <AddIcon/>
                        </IconButton>
                    </Box>
                );
            } else {
                return (
                    <Box key={'Value ' + index + ' ' + column.dataKey} position="relative" display="inline-block"
                         margin={1}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="outlined">
                                Balance?
                            </Button>
                            <Button variant="outlined">
                                Value?
                            </Button>
                            <Button variant="outlined">
                                Balance?
                            </Button>
                        </Stack>
                    </Box>
                );
            }

        }

        return (
            <React.Fragment>
                {initialColumns.map((column) => {
                    let cellContent;

                    if (0 === rowIndex && ('plan1' === column.dataKey || 'plan2' === column.dataKey)) {
                        cellContent = (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{m: 1}}
                                        disabled={inputs[column.dataKey] === undefined}>
                                    {'accomplished?'}
                                </Button>
                                <Button variant="outlined"
                                        onClick={(e: { currentTarget: any; }) => handleClick(e, column.dataKey)}
                                        sx={{m: 1}}>
                                    {labels[column.dataKey]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls[column.dataKey]}
                                    open={Boolean(anchorEls[column.dataKey])}
                                    onClose={() => handleClose(column.dataKey)}
                                >
                                    <MenuItem>
                                        <TextField
                                            label="Plan"
                                            value={inputs[column.dataKey]?.input || ''}
                                            onChange={(e) => handleInputChange(column.dataKey, 'input', e.target.value)}
                                            fullWidth
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained" onClick={() => handleConfirm(column.dataKey)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{m: 1}}>
                                    {'G Plan Agent ' + column.dataKey[column.dataKey.length - 1]}
                                </Button>
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{m: 1}}>
                                    {'Agent ' + column.dataKey[column.dataKey.length - 1]}
                                </Button>
                            </Box>
                        );
                    } else if (1 === rowIndex && ('plan1' === column.dataKey || 'plan2' === column.dataKey)) {
                        cellContent = (<>
                            {groups.map((el, index) => {
                                    if (el === 3) {
                                        return ButtonsValue(index, column, false)
                                    } else if (el === 1 && 'plan1' === column.dataKey) {
                                        return ButtonsValue(index, column, true)
                                    } else if (el === 2 && 'plan2' === column.dataKey) {
                                        return ButtonsValue(index, column, true)
                                    } else if (el === 1 && 'plan2' === column.dataKey) {
                                        return (
                                            <div key={'Value ' + index + ' ' + column.dataKey}
                                                 style={{height: '3.70em'}}>
                                            </div>
                                        )
                                    } else if (el === 2 && 'plan1' === column.dataKey) {
                                        return (
                                            <div key={'Value ' + index + ' ' + column.dataKey}
                                                 style={{height: '3.70em'}}>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div key={'Value ' + index + ' ' + column.dataKey}>
                                            </div>
                                        )
                                    }
                                }
                            )}
                        </>)
                    } else if (1 === rowIndex && 'preUnit' === column.dataKey) {
                        cellContent = (<div style={{marginTop: '-1.03em'}}>
                            {groups.map((el, index) => {
                                    if (el === 1 || el === 2) {
                                        return <Box key={'Value ' + index + ' ' + column.dataKey} position="relative"
                                                    display="inline-block"
                                                    margin={1}>
                                            <Stack direction="row" spacing={2}>
                                                <Button variant="outlined">
                                                    Balance?
                                                </Button>
                                            </Stack>
                                        </Box>
                                    } else {
                                        return (
                                            <div key={'Value ' + index + ' ' + column.dataKey}
                                                 style={{height: '3.70em'}}>
                                            </div>
                                        )
                                    }
                                }
                            )}
                        </div>)
                    }
                    return (
                        <TableCell
                            key={column.dataKey}
                            align={'right'}
                            sx={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: column.width}}
                        >
                            {cellContent}
                            <Typography
                                variant="caption"
                                display="block"
                                gutterBottom
                                sx={{
                                    fontSize: '0.6rem',
                                    color: 'rgba(128, 128, 128, 0.7)',
                                    bottom: 0,
                                    right: 0,
                                }}
                            >
                                {row[column.dataKey]}
                            </Typography>
                        </TableCell>
                    );
                })}
            </React.Fragment>
        );
    };


    return (
        <div className='edit'>
            <Paper style={{display: 'flex', flexDirection: 'column', height: '630px'}}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                            <TableRow>
                                <TableCell align="center" colSpan={initialColumns.length}
                                           sx={{
                                               textAlign: 'center',
                                           }}>
                                    <TextField id="Title" label="Title" variant="standard"/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align={"center"} colSpan={initialColumns.length}
                                           className="triangle-container">
                                    Unit Hierarchy
                                </TableCell>
                            </TableRow>
                            {header()}
                        </TableHead>
                        <TableBody>
                            {initialRows.map((row, index) => (
                                <TableRow key={index}>
                                    {rowContent(index, row)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}

export default Edit;
