import * as React from "react";
import {useState} from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import {
    Box,
    IconButton,
    Input,
    Menu,
    MenuItem,
    Stack,
    TableBody,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {ColumnData, Data, initialColumns} from "./Edit";

interface Labels {
    [key: string]: any;
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

const initialRows: Data[] = Array.from({length: sampleStandard.length}, (_, index) => {
    const selection = sampleStandard[index];
    return createData(...selection);
});

function TableEdit(data: any, updateData: any) {
    const [groups, setGroups] = useState([3]);
    const [labels, setLabels] = useState<Labels>({
        accplan1: 'accomplished?',
        accplan2: 'accomplished?',
        plan1: 'P Agent 1 Title',
        plan2: 'P Agent 2 Title',
        goalplan1: 'G Plan Agent 1',
        goalplan2: 'G Plan Agent 2',
        agentplan1: 'Agent 1',
        agentplan2: 'Agent 2',
    });
    const [anchorEls, setAnchorEls] = useState<AnchorEls>({});
    const [inputs, setInputs] = useState<Inputs>({});

    let column = initialColumns
    const handleClick = (event: { currentTarget: any; }, id: any) => {
        setAnchorEls((prev) => ({...prev, [id]: event.currentTarget}));
    };

    const handleClose = (id: any) => {
        setAnchorEls((prev) => ({...prev, [id]: null}));
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

    const handleConfirm = (id: any, action?: string) => {
        if (inputs[id] !== undefined || id === 'accplan1' || id === 'accplan2') {
            setLabels(prevLabels => {
                switch (id) {
                    case 'plan1':
                        return {...prevLabels, plan1: inputs[id]['input']};
                    case 'goalplan1':
                        return {...prevLabels, goalplan1: inputs[id]['input']};
                    case 'agentplan1':
                        return {...prevLabels, agentplan1: inputs[id]['input']};
                    case 'plan2':
                        return {...prevLabels, plan2: inputs[id]['input']};
                    case 'goalplan2':
                        return {...prevLabels, goalplan2: inputs[id]['input']};
                    case 'agentplan2':
                        return {...prevLabels, agentplan2: inputs[id]['input']};
                    case 'accplan1':
                        return {...prevLabels, accplan1: action};
                    case 'accplan2':
                        return {...prevLabels, accplan2: action};
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
                {column.map((column) => {
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
                                <Button
                                    variant="outlined"
                                    onClick={(e) => handleClick(e, 'acc' + column.dataKey)}
                                    sx={{
                                        m: 1,
                                        borderColor: labels['acc' + column.dataKey] === 'Accomplished'
                                            ? 'green'
                                            : labels['acc' + column.dataKey] === 'Unaccomplished'
                                                ? 'red' : 'theme.palette.primary.main',
                                        color: labels['acc' + column.dataKey] === 'Accomplished'
                                            ? 'green'
                                            : labels['acc' + column.dataKey] === 'Unaccomplished'
                                                ? 'red' : 'theme.palette.primary.main'
                                    }}
                                    disabled={inputs[column.dataKey] === undefined}
                                >
                                    {labels['acc' + column.dataKey]}
                                </Button>

                                <Menu
                                    anchorEl={anchorEls['acc' + column.dataKey]}
                                    open={Boolean(anchorEls['acc' + column.dataKey])}
                                    onClose={() => handleClose('acc' + column.dataKey)}
                                >
                                    <MenuItem>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleConfirm('acc' + column.dataKey, 'Accomplished')}
                                            style={{backgroundColor: 'green', color: 'white'}}
                                        >
                                            Accomplished
                                        </Button>

                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained"
                                                onClick={() => handleConfirm('acc' + column.dataKey, 'Unaccomplished')}
                                                style={{backgroundColor: 'red', color: 'white'}}
                                        >
                                            Unaccomplished
                                        </Button>
                                    </MenuItem>
                                </Menu>
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
                                        <Input
                                            placeholder="Plan"
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
                                        onClick={(e: {
                                            currentTarget: any;
                                        }) => handleClick(e, 'goal' + column.dataKey)}
                                        sx={{m: 1}}>
                                    {labels['goal' + column.dataKey]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls['goal' + column.dataKey]}
                                    open={Boolean(anchorEls['goal' + column.dataKey])}
                                    onClose={() => handleClose('goal' + column.dataKey)}
                                >
                                    <MenuItem>
                                        <Input
                                            placeholder="Goal"
                                            value={inputs['goal' + column.dataKey]?.input || ''}
                                            onChange={(e) => handleInputChange('goal' + column.dataKey, 'input', e.target.value)}
                                            fullWidth
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained"
                                                onClick={() => handleConfirm('goal' + column.dataKey)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Button variant="outlined"
                                        onClick={(e: {
                                            currentTarget: any;
                                        }) => handleClick(e, 'agent' + column.dataKey)}
                                        sx={{m: 1}}>
                                    {labels['agent' + column.dataKey]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls['agent' + column.dataKey]}
                                    open={Boolean(anchorEls['agent' + column.dataKey])}
                                    onClose={() => handleClose('agent' + column.dataKey)}
                                >
                                    <MenuItem>
                                        <Input
                                            placeholder="Agent"
                                            value={inputs['agent' + column.dataKey]?.input || ''}
                                            onChange={(e) => handleInputChange('agent' + column.dataKey, 'input', e.target.value)}
                                            fullWidth
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained"
                                                onClick={() => handleConfirm('agent' + column.dataKey)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
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
        <TableBody>
            {initialRows.map((row, index) => (
                <TableRow key={index}>
                    {rowContent(index, row)}
                </TableRow>
            ))}
        </TableBody>
    );
}

export default TableEdit;