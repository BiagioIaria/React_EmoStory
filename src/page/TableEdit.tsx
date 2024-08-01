import * as React from "react";
import {useEffect, useState} from "react";
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {ColumnData, Data, initialColumns} from "./Edit";
import axios from "axios";
import {variables} from "../endPoint";

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

const sampleS: readonly Sample[] = [
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

const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'C' || event.key === 'c') {
        event.stopPropagation();
    }
};

function TableEdit(params: any) {
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
        sxSupport: 'Support?',
        dxSupport: 'Support?',
        conflict: 'Conflict?',
    });
    const [queryLabels, setQueryLabels] = useState<Labels>({
        accplan1: '',
        accplan2: '',
        plan1: '',
        plan2: '',
        goalplan1: '',
        goalplan2: '',
        agentplan1: '',
        agentplan2: '',
        sxSupport: '',
        dxSupport: '',
        conflict: '',
    });

    const [anchorEls, setAnchorEls] = useState<AnchorEls>({});
    const [inputs, setInputs] = useState<Inputs>({});
    const [triplesQuery, setTriplesQuery] = useState<Labels>({});
    useEffect(() => {
        const len = Object.values(queryLabels).length
        const firstPartValid = Object.values(queryLabels).slice(0, len - 3).every((value: string) => value !== '');

        const lastPartValid = Object.values(queryLabels).slice(len - 3).some((value: string) => value !== '');

        const prefixQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.purl.org/drammar#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        `
        if (params.data[0]['value'] !== '' && firstPartValid && lastPartValid) {
            const fetchDataInsert = async (t: string) => {
                try {

                    const query = `${prefixQuery}
                          INSERT DATA {
                            :${params.data[0].value} rdf:type :` + t + ` .
                            :${params.data[0].value} rdfs:comment "${params.data[0].value}" .
                            :Timeline_${params.data[0]['value']} rdf:type :Timeline .
                            :Timeline_${params.data[0]['value']} rdfs:comment "${params.data[0].value}" .
                          }
                        `;

                    await axios.post(variables.API_URL_POST, query, {
                        headers: {
                            'Content-Type': 'application/sparql-update'
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
            };

            const fetchDataDelete = async (t: string) => {
                try {

                    const query = `${prefixQuery}
                        DELETE {
                          :${t} ?p ?o .
                          ?s ?p :${t} .
                          ?s :${t} ?o .
                        }
                        WHERE {
                          {
                            :${t} ?p ?o .
                          }
                          UNION
                          {
                            ?s ?p :${t} .
                          }
                          UNION
                          {
                            ?s :${t} ?o .
                          }
                        }
                        `;

                    await axios.post(variables.API_URL_POST, query, {
                        headers: {
                            'Content-Type': 'application/sparql-update'
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
            };

            if (Object.values(triplesQuery).length === 0) {

                setTriplesQuery(
                    {
                        Unit: params.data[0]['value'],
                        Timeline: `Timeline_${params.data[0]['value']}`
                    }
                )
                fetchDataInsert('Unit').then();

            } else if (!Object.values(triplesQuery).includes(params.data[0]['value'])) {

                fetchDataDelete(triplesQuery['Unit']).then()
                fetchDataDelete(triplesQuery['Timeline']).then()
                setTriplesQuery(
                    {
                        Unit: params.data[0]['value'],
                        Timeline: `Timeline_${params.data[0]['value']}`
                    }
                )
                fetchDataInsert('Unit').then();

            }
        }
        // eslint-disable-next-line
    }, [params.data, queryLabels]);

    let template: string | any[] | readonly Sample[]
    let posForTemplate = ['']
    if (params.temp === '2') {
        template = sampleB
        posForTemplate[0] = 'unit_b'
        posForTemplate[1] = 'plan2'
    } else if (params.temp === '3') {
        template = sampleN
        posForTemplate[0] = 'plan1'
        posForTemplate[1] = 'unit_n'
    } else {
        template = sampleS
        posForTemplate[0] = 'plan1'
        posForTemplate[1] = 'plan2'
    }

    const initialRows: Data[] = Array.from({length: template.length}, (_, index) => {
        const selection: Sample = template[index];
        return createData(...selection);
    });

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
        if (inputs[id] !== undefined ||
            id === 'accplan1' ||
            id === 'accplan2' ||
            id.startsWith('balPre') ||
            id.startsWith('balEff') ||
            id.startsWith('balPreUnit') ||
            id === 'sxSupport' ||
            id === 'conflict' ||
            id === 'dxSupport') {

            setQueryLabels(prevLabels => {
                if (id.startsWith('balPre') ||
                    (id.startsWith('balEff')) ||
                    (id.startsWith('balPreUnit'))) {
                    return {...prevLabels, [id]: action};
                } else if (id.startsWith('value')) {
                    return {...prevLabels, [id]: inputs[id]['input']};
                }
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
                    case 'sxSupport':
                        if (action === 'Support') {
                            return {...prevLabels, sxSupport: ''};
                        } else {
                            return {...prevLabels, sxSupport: 'Support', conflict: ''};
                        }
                    case 'conflict':
                        if (action === 'Conflict') {
                            return {...prevLabels, conflict: ''};
                        } else {
                            return {...prevLabels, sxSupport: '', dxSupport: '', conflict: 'Conflict'};
                        }
                    case 'dxSupport':
                        if (action === 'Support') {
                            return {...prevLabels, dxSupport: ''};
                        } else {
                            return {...prevLabels, dxSupport: 'Support', conflict: ''};
                        }
                    default:
                        return prevLabels;
                }
            });

            setLabels(prevLabels => {
                if (id.startsWith('balPre') ||
                    (id.startsWith('balEff')) ||
                    (id.startsWith('balPreUnit'))) {
                    return {...prevLabels, [id]: action};
                } else if (id.startsWith('value')) {
                    return {...prevLabels, [id]: inputs[id]['input']};
                }
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
                    case 'sxSupport':
                        if (action === 'Support') {
                            return {...prevLabels, sxSupport: 'Support?'};
                        } else {
                            return {...prevLabels, sxSupport: 'Support', conflict: 'Conflict?'};
                        }
                    case 'conflict':
                        if (action === 'Conflict') {
                            return {...prevLabels, conflict: 'Conflict?'};
                        } else {
                            return {...prevLabels, sxSupport: 'Support?', dxSupport: 'Support?', conflict: 'Conflict'};
                        }
                    case 'dxSupport':
                        if (action === 'Support') {
                            return {...prevLabels, dxSupport: 'Support?'};
                        } else {
                            return {...prevLabels, dxSupport: 'Support', conflict: 'Conflict?'};
                        }
                    default:
                        return prevLabels;
                }
            });
            handleClose(id);
        }
    };


    const addGroup = (col: any) => {
        groups.pop()
        let keyLabel: string
        if (col === 'unit_b') {
            keyLabel = 'plan1'
        } else if (col === 'unit_n') {
            keyLabel = 'plan2'
        } else {
            keyLabel = col
        }
        setGroups([...groups, Number(keyLabel[keyLabel.length - 1]), 3]);
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
                            <Button variant="outlined"
                                    onDoubleClick={(e) => {
                                        if (labels['balPre' + index + '_' + column.dataKey] !== undefined) {
                                            handleClick(e, 'balPre' + index + '_' + column.dataKey)
                                        }
                                    }}
                                    onClick={(e) => {
                                        if (labels['balPre' + index + '_' + column.dataKey] === undefined) {
                                            handleClick(e, 'balPre' + index + '_' + column.dataKey)
                                        }
                                    }}
                                    sx={{
                                        m: 1,
                                        borderColor: labels['balPre' + index + '_' + column.dataKey] === 'inBalance'
                                            ? 'green'
                                            : labels['balPre' + index + '_' + column.dataKey] === 'atStake'
                                                ? 'red' : 'theme.palette.primary.main',
                                        color: labels['balPre' + index + '_' + column.dataKey] === 'inBalance'
                                            ? 'green'
                                            : labels['balPre' + index + '_' + column.dataKey] === 'atStake'
                                                ? 'red' : 'theme.palette.primary.main'
                                    }}>
                                {labels['balPre' + index + '_' + column.dataKey] === undefined ? 'Balance?' : labels['balPre' + index + '_' + column.dataKey]}
                            </Button>
                            <Menu
                                anchorEl={anchorEls['balPre' + index + '_' + column.dataKey]}
                                open={Boolean(anchorEls['balPre' + index + '_' + column.dataKey])}
                                onClose={() => handleClose('balPre' + index + '_' + column.dataKey)}
                            >
                                <MenuItem>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleConfirm('balPre' + index + '_' + column.dataKey, 'inBalance')}
                                        style={{backgroundColor: 'green', color: 'white'}}
                                    >
                                        inBalance
                                    </Button>

                                </MenuItem>
                                <MenuItem>
                                    <Button variant="contained"
                                            onClick={() => handleConfirm('balPre' + index + '_' + column.dataKey, 'atStake')}
                                            style={{backgroundColor: 'red', color: 'white'}}
                                    >
                                        atStake
                                    </Button>
                                </MenuItem>
                            </Menu>
                            <Button variant="outlined"
                                    onDoubleClick={(e) => {
                                        if (inputs['value' + index + '_' + column.dataKey] !== undefined) {
                                            handleClick(e, 'value' + index + '_' + column.dataKey);
                                        }
                                    }}
                                    onClick={(e) => {
                                        if (inputs['value' + index + '_' + column.dataKey] === undefined) {
                                            handleClick(e, 'value' + index + '_' + column.dataKey)
                                        }
                                    }}
                            >
                                {labels['value' + index + '_' + column.dataKey] === undefined ? 'Value?' : labels['value' + index + '_' + column.dataKey]}
                            </Button>
                            <Menu
                                anchorEl={anchorEls['value' + index + '_' + column.dataKey]}
                                open={Boolean(anchorEls['value' + index + '_' + column.dataKey])}
                                onClose={() => handleClose('value' + index + '_' + column.dataKey)}
                            >
                                <MenuItem>
                                    <Input
                                        placeholder="Value"
                                        value={inputs['value' + index + '_' + column.dataKey]?.input || ''}
                                        onChange={(e) => handleInputChange('value' + index + '_' + column.dataKey, 'input', e.target.value)}
                                        fullWidth
                                        onKeyDown={handleKeyDown}
                                    />
                                </MenuItem>
                                <MenuItem>
                                    <Button variant="contained"
                                            onClick={() => handleConfirm('value' + index + '_' + column.dataKey)}>
                                        Confirm
                                    </Button>
                                </MenuItem>
                            </Menu>
                            <Button variant="outlined"
                                    onDoubleClick={(e) => {
                                        if (labels['balEff' + index + '_' + column.dataKey] !== undefined) {
                                            handleClick(e, 'balEff' + index + '_' + column.dataKey)
                                        }
                                    }}
                                    onClick={(e) => {
                                        if (labels['balEff' + index + '_' + column.dataKey] === undefined) {
                                            handleClick(e, 'balEff' + index + '_' + column.dataKey)
                                        }
                                    }}
                                    sx={{
                                        m: 1,
                                        borderColor: labels['balEff' + index + '_' + column.dataKey] === 'inBalance'
                                            ? 'green'
                                            : labels['balEff' + index + '_' + column.dataKey] === 'atStake'
                                                ? 'red' : 'theme.palette.primary.main',
                                        color: labels['balEff' + index + '_' + column.dataKey] === 'inBalance'
                                            ? 'green'
                                            : labels['balEff' + index + '_' + column.dataKey] === 'atStake'
                                                ? 'red' : 'theme.palette.primary.main'
                                    }}>
                                {labels['balEff' + index + '_' + column.dataKey] === undefined ? 'Balance?' : labels['balEff' + index + '_' + column.dataKey]}
                            </Button>
                            <Menu
                                anchorEl={anchorEls['balEff' + index + '_' + column.dataKey]}
                                open={Boolean(anchorEls['balEff' + index + '_' + column.dataKey])}
                                onClose={() => handleClose('balEff' + index + '_' + column.dataKey)}
                            >
                                <MenuItem>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleConfirm('balEff' + index + '_' + column.dataKey, 'inBalance')}
                                        style={{backgroundColor: 'green', color: 'white'}}
                                    >
                                        inBalance
                                    </Button>

                                </MenuItem>
                                <MenuItem>
                                    <Button variant="contained"
                                            onClick={() => handleConfirm('balEff' + index + '_' + column.dataKey, 'atStake')}
                                            style={{backgroundColor: 'red', color: 'white'}}
                                    >
                                        atStake
                                    </Button>
                                </MenuItem>
                            </Menu>
                        </Stack>
                    </Box>
                );
            }

        }

        return (
            <React.Fragment>
                {column.map((column) => {
                    let cellContent;
                    let keyLabel: string

                    if (0 === rowIndex && (posForTemplate[0] === column.dataKey || posForTemplate[1] === column.dataKey)) {

                        if (column.dataKey === 'unit_b') {
                            keyLabel = 'plan1'
                        } else if (column.dataKey === 'unit_n') {
                            keyLabel = 'plan2'
                        } else {
                            keyLabel = column.dataKey
                        }

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
                                    onDoubleClick={(e) => {
                                        if (labels['acc' + keyLabel] !== 'accomplished?') {
                                            handleClick(e, 'acc' + keyLabel);
                                        }
                                    }}
                                    onClick={(e) => {
                                        if (labels['acc' + keyLabel] === 'accomplished?') {
                                            handleClick(e, 'acc' + keyLabel)
                                        }
                                    }}
                                    sx={{
                                        m: 1,
                                        borderColor: labels['acc' + keyLabel] === 'Accomplished'
                                            ? 'green'
                                            : labels['acc' + keyLabel] === 'Unaccomplished'
                                                ? 'red' : 'theme.palette.primary.main',
                                        color: labels['acc' + keyLabel] === 'Accomplished'
                                            ? 'green'
                                            : labels['acc' + keyLabel] === 'Unaccomplished'
                                                ? 'red' : 'theme.palette.primary.main'
                                    }}
                                    disabled={inputs[keyLabel] === undefined}
                                >
                                    {labels['acc' + keyLabel]}
                                </Button>

                                <Menu
                                    anchorEl={anchorEls['acc' + keyLabel]}
                                    open={Boolean(anchorEls['acc' + keyLabel])}
                                    onClose={() => handleClose('acc' + keyLabel)}
                                >
                                    <MenuItem>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleConfirm('acc' + keyLabel, 'Accomplished')}
                                            style={{backgroundColor: 'green', color: 'white'}}
                                        >
                                            Accomplished
                                        </Button>

                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained"
                                                onClick={() => handleConfirm('acc' + keyLabel, 'Unaccomplished')}
                                                style={{backgroundColor: 'red', color: 'white'}}
                                        >
                                            Unaccomplished
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Button variant="outlined"
                                        onDoubleClick={(e) => {
                                            if (inputs[keyLabel] !== undefined) {
                                                handleClick(e, keyLabel);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (inputs[keyLabel] === undefined) {
                                                handleClick(e, keyLabel);
                                            }
                                        }}
                                        sx={{m: 1}}>
                                    {labels[keyLabel]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls[keyLabel]}
                                    open={Boolean(anchorEls[keyLabel])}
                                    onClose={() => handleClose(keyLabel)}
                                >
                                    <MenuItem>
                                        <Input
                                            placeholder="Plan"
                                            value={inputs[keyLabel]?.input || ''}
                                            onChange={(e) => handleInputChange(keyLabel, 'input', e.target.value)}
                                            fullWidth
                                            onKeyDown={handleKeyDown}
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained" onClick={() => handleConfirm(keyLabel)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Button variant="outlined"
                                        onDoubleClick={(e) => {
                                            if (inputs['goal' + keyLabel] !== undefined) {
                                                handleClick(e, 'goal' + keyLabel);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (inputs['goal' + keyLabel] === undefined) {
                                                handleClick(e, 'goal' + keyLabel)
                                            }
                                        }}
                                        sx={{m: 1}}>
                                    {labels['goal' + keyLabel]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls['goal' + keyLabel]}
                                    open={Boolean(anchorEls['goal' + keyLabel])}
                                    onClose={() => handleClose('goal' + keyLabel)}
                                >
                                    <MenuItem>
                                        <Input
                                            placeholder="Goal"
                                            value={inputs['goal' + keyLabel]?.input || ''}
                                            onChange={(e) => handleInputChange('goal' + keyLabel, 'input', e.target.value)}
                                            fullWidth
                                            onKeyDown={handleKeyDown}
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained"
                                                onClick={() => handleConfirm('goal' + keyLabel)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Button variant="outlined"
                                        onDoubleClick={(e) => {
                                            if (inputs['agent' + keyLabel] !== undefined) {
                                                handleClick(e, 'agent' + keyLabel);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (inputs['agent' + keyLabel] === undefined) {
                                                handleClick(e, 'agent' + keyLabel)
                                            }
                                        }}
                                        sx={{m: 1}}>
                                    {labels['agent' + keyLabel]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls['agent' + keyLabel]}
                                    open={Boolean(anchorEls['agent' + keyLabel])}
                                    onClose={() => handleClose('agent' + keyLabel)}
                                >
                                    <MenuItem>
                                        <Input
                                            placeholder="Agent"
                                            value={inputs['agent' + keyLabel]?.input || ''}
                                            onChange={(e) => handleInputChange('agent' + keyLabel, 'input', e.target.value)}
                                            fullWidth
                                            onKeyDown={handleKeyDown}
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained"
                                                onClick={() => handleConfirm('agent' + keyLabel)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        );
                    } else if (1 === rowIndex && (posForTemplate[0] === column.dataKey || posForTemplate[1] === column.dataKey)) {
                        cellContent = (<>
                            {groups.map((el, index) => {
                                    if (el === 3) {
                                        return ButtonsValue(index, column, false)
                                    } else if (el === 1 && posForTemplate[0] === column.dataKey) {
                                        return ButtonsValue(index, column, true)
                                    } else if (el === 2 && posForTemplate[1] === column.dataKey) {
                                        return ButtonsValue(index, column, true)
                                    } else if (el === 1 && posForTemplate[1] === column.dataKey) {
                                        return (
                                            <div key={'Value ' + index + ' ' + column.dataKey}
                                                 style={{height: '3.70em'}}>
                                            </div>
                                        )
                                    } else if (el === 2 && posForTemplate[0] === column.dataKey) {
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
                                                <Button variant="outlined"
                                                        onDoubleClick={(e) => {
                                                            if (labels['balPreUnit' + index + '_' + column.dataKey] !== undefined) {
                                                                handleClick(e, 'balPreUnit' + index + '_' + column.dataKey);
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            if (labels['balPreUnit' + index + '_' + column.dataKey] === undefined) {
                                                                handleClick(e, 'balPreUnit' + index + '_' + column.dataKey)
                                                            }
                                                        }}
                                                        sx={{
                                                            m: 1,
                                                            borderColor: labels['balPreUnit' + index + '_' + column.dataKey] === 'inBalance'
                                                                ? 'green'
                                                                : labels['balPreUnit' + index + '_' + column.dataKey] === 'atStake'
                                                                    ? 'red' : 'theme.palette.primary.main',
                                                            color: labels['balPreUnit' + index + '_' + column.dataKey] === 'inBalance'
                                                                ? 'green'
                                                                : labels['balPreUnit' + index + '_' + column.dataKey] === 'atStake'
                                                                    ? 'red' : 'theme.palette.primary.main'
                                                        }}>
                                                    {labels['balPreUnit' + index + '_' + column.dataKey] === undefined ? 'Balance?' : labels['balPreUnit' + index + '_' + column.dataKey]}
                                                </Button>
                                                <Menu
                                                    anchorEl={anchorEls['balPreUnit' + index + '_' + column.dataKey]}
                                                    open={Boolean(anchorEls['balPreUnit' + index + '_' + column.dataKey])}
                                                    onClose={() => handleClose('balPreUnit' + index + '_' + column.dataKey)}
                                                >
                                                    <MenuItem>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleConfirm('balPreUnit' + index + '_' + column.dataKey, 'inBalance')}
                                                            style={{backgroundColor: 'green', color: 'white'}}
                                                        >
                                                            inBalance
                                                        </Button>

                                                    </MenuItem>
                                                    <MenuItem>
                                                        <Button variant="contained"
                                                                onClick={() => handleConfirm('balPreUnit' + index + '_' + column.dataKey, 'atStake')}
                                                                style={{backgroundColor: 'red', color: 'white'}}
                                                        >
                                                            atStake
                                                        </Button>
                                                    </MenuItem>
                                                </Menu>
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
                    } else if (0 === rowIndex && 'unit' === column.dataKey) {
                        cellContent = (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <IconButton
                                    onClick={() => handleConfirm('sxSupport', labels['sxSupport'])}
                                    sx={{
                                        m: 1,
                                        border: labels['sxSupport'] === 'Support?' || labels['sxSupport'] === 'Support' ? '1px solid' : '',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        borderColor: labels['sxSupport'] === 'Support?'
                                            ? 'theme.palette.primary.main'
                                            : labels['sxSupport'] === 'Support'
                                                ? 'green' : '',
                                        color: labels['sxSupport'] === 'Support?'
                                            ? 'theme.palette.primary.main'
                                            : labels['sxSupport'] === 'Support'
                                                ? 'green' : '',
                                    }}
                                    disabled={inputs['plan1'] === undefined || inputs['plan2'] === undefined}
                                >
                                    <ArrowBackIosNewIcon/>
                                    <Typography variant="button" display="block">{labels['sxSupport']}</Typography>
                                </IconButton>
                                <IconButton
                                    onClick={() => handleConfirm('conflict', labels['conflict'])}
                                    sx={{
                                        m: 1,
                                        border: labels['conflict'] === 'Conflict?' || labels['conflict'] === 'Conflict' ? '1px solid' : '',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        borderColor: labels['conflict'] === 'Conflict?'
                                            ? 'theme.palette.primary.main'
                                            : labels['conflict'] === 'Conflict'
                                                ? 'red' : '',
                                        color: labels['conflict'] === 'Conflict?'
                                            ? 'theme.palette.primary.main'
                                            : labels['conflict'] === 'Conflict'
                                                ? 'red' : '',
                                    }}
                                    disabled={inputs['plan1'] === undefined || inputs['plan2'] === undefined}
                                >
                                    <ArrowBackIosNewIcon/>
                                    <Typography variant="button" display="block">{labels['conflict']}</Typography>
                                    <ArrowForwardIosIcon/>
                                </IconButton>
                                <IconButton
                                    onClick={() => handleConfirm('dxSupport', labels['dxSupport'])}
                                    sx={{
                                        m: 1,
                                        border: labels['dxSupport'] === 'Support?' || labels['dxSupport'] === 'Support' ? '1px solid' : '',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        borderColor: labels['dxSupport'] === 'Support?'
                                            ? 'theme.palette.primary.main'
                                            : labels['dxSupport'] === 'Support'
                                                ? 'green' : '',
                                        color: labels['dxSupport'] === 'Support?'
                                            ? 'theme.palette.primary.main'
                                            : labels['dxSupport'] === 'Support'
                                                ? 'green' : '',
                                    }}
                                    disabled={inputs['plan1'] === undefined || inputs['plan2'] === undefined}
                                >
                                    <Typography variant="button" display="block">{labels['dxSupport']}</Typography>
                                    <ArrowForwardIosIcon/>
                                </IconButton>
                            </Box>
                        );
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