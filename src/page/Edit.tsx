import React, {useEffect, useState} from 'react';
import TableEdit from "./TableEdit";
import {
    Box,
    Button,
    CircularProgress,
    Input,
    Menu,
    MenuItem,
    Table,
    TableContainer,
    TableHead,
    TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Paper from "@mui/material/Paper";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {useLocation} from "react-router-dom";
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


const columnWidth = 120;
export let initialColumns: ColumnData[] = [
    {
        width: columnWidth,
        label: 'Unit i-',
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
        label: 'Unit i',
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

export interface ColumnData {
    dataKey: keyof Data;
    label: string;
    width: number;
}

export interface Data {
    [key: string]: string;

    unit_b: string;
    preUnit: string;
    plan1: string;
    unit: string;
    plan2: string;
    effUnit: string;
    unit_n: string;
}

function useParams() {
    return new URLSearchParams(useLocation().search);
}

const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'C' || event.key === 'c') {
        event.stopPropagation();
    }
};

function Edit() {
    const [anchorEls, setAnchorEls] = useState<AnchorEls>({});
    const [inputs, setInputs] = useState<Inputs>({});
    const [labels, setLabels] = useState<Labels>({
        unit: initialColumns[3].label
    });

    const [data, setData] = useState([
        {id: 'unit', value: ''},
        {id: 1, value: ''},
    ]);
    const [unitQuery, setUnitQuery] = useState('');
    const [loading, setLoading] = useState(false);


    let params = useParams();
    const temp = params.get("temp");

    useEffect(() => {
        setTableEdits(prevTableEdits =>
            prevTableEdits.map((edit, index) => (
                <TableEdit key={edit.key} data={data} updateData={updateData} temp={temp} idTableEdit={index}/>
            ))
        );
        // eslint-disable-next-line
    }, [data]);

    useEffect(() => {

        if (data[0]['value'] !== '') {
            const fetchDataInsert = async () => {
                const unit = data[0]['value'].replace(/ /g, '_')
                const prefixQuery = `
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX : <http://www.purl.org/drammar#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                `
                try {
                    let query

                    query = `${prefixQuery}
                          INSERT DATA {
                            :${unit} rdf:type :Unit .
                            :${unit} rdfs:comment "${unit}" .
                            :Timeline_${unit} rdf:type :Timeline .
                            :Timeline_${unit} rdfs:comment "${unit}" .
                            :Effect_${unit} rdf:type :ConsistentStateSet .
                            :Effect_${unit} rdfs:comment "${unit}".
                            :Timeline_${unit} :hasTimelineEffect :Effect_${unit}.
                            :Precondition_${unit} rdf:type :ConsistentStateSet .
                            :Precondition_${unit} rdfs:comment "${unit}".
                            :Timeline_${unit} :hasTimelinePrecondition :Precondition_${unit} .
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
            }

            const fetchDataDelete = async (u: string) => {

                try {
                    const query = `
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                       
                        DELETE {
                          ?individual ?p ?o .
                          ?s ?p2 ?individual .
                        }
                        WHERE {
                          ?individual rdfs:comment "${u}" .
                          OPTIONAL {
                            ?individual ?p ?o .
                          }
                          OPTIONAL {
                            ?s ?p2 ?individual .
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

            fetchDataDelete(unitQuery).then(
                () => fetchDataInsert().then(
                    () => setUnitQuery(data[0]['value'])
                )
            )
        }
        // eslint-disable-next-line
    }, [data[0]['value']]);

    const updateData = (id: any, newValue: any) => {
        setData((prevData) =>
            prevData.map((item) =>
                item.id === id ? {...item, value: newValue} : item
            )
        );
    };

    const [tableEdits, setTableEdits] = useState([<TableEdit key={0} data={data} updateData={updateData}
                                                             temp={temp} idTableEdit={0}/>]);

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

    const handleConfirm = (id: any) => {
        if (inputs[id] !== undefined) {
            setLabels(prevLabels => {
                switch (id) {
                    case 'unit':
                        updateData('unit', inputs[id]['input'])
                        initialColumns = initialColumns.map(column => ({
                            ...column,
                            label: column.label.replace('Unit i', inputs[id]['input'])
                        }));
                        return {...prevLabels, unit: inputs[id]['input']};
                    default:
                        return prevLabels;
                }
            });
            handleClose(id);
        }
    };

    const addTableEdit = () => {
        const newItem = {id: data.length, value: ''};
        setData([...data, newItem]);
        setTableEdits(prevTableEdits => [
            ...prevTableEdits,
            <TableEdit key={prevTableEdits.length} data={data} updateData={updateData} temp={temp}/>
        ]);
    };

    const header = () => (
        <TableRow>
            {initialColumns.map((col) => {
                    if ('unit' === col.dataKey) {
                        return (
                            <TableCell key={col.dataKey}
                                       style={{width: col.width, textAlign: "center"}}
                            >
                                <Button variant="outlined"
                                        onDoubleClick={(e) => {
                                            if (inputs[col.dataKey] !== undefined) {
                                                handleClick(e, col.dataKey);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (inputs[col.dataKey] === undefined) {
                                                handleClick(e, col.dataKey);
                                            }
                                        }}
                                        sx={{m: 1}}>
                                    {labels[col.dataKey]}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls[col.dataKey]}
                                    open={Boolean(anchorEls[col.dataKey])}
                                    onClose={() => handleClose(col.dataKey)}
                                >
                                    <MenuItem>
                                        <Input
                                            placeholder="Unit"
                                            value={inputs[col.dataKey]?.input || ''}
                                            onChange={(e) => handleInputChange(col.dataKey, 'input', e.target.value)}
                                            fullWidth
                                            onKeyDown={handleKeyDown}
                                        />
                                    </MenuItem>
                                    <MenuItem>
                                        <Button variant="contained" onClick={() => handleConfirm(col.dataKey)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                            </TableCell>
                        )
                    } else {
                        return (
                            <TableCell key={col.dataKey}
                                       style={{width: col.width, textAlign: "center"}}
                            >{col.label}</TableCell>
                        )
                    }
                }
            )}
        </TableRow>
    );

    const handleClickInference = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/inference/run', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Risposta:', response.data);
        } catch (error) {
            console.error('Errore:', error);
        } finally {
            setLoading(false);
        }
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
                        {tableEdits}
                    </Table>
                </TableContainer>
            </Paper>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={addTableEdit}
                >
                    <AddIcon/>
                </Button>
            </div>
            <Box textAlign="center" mt={5}>
                <Button
                    variant="contained"
                    onClick={handleClickInference}
                    style={{
                        backgroundColor: 'lightyellow',
                        color: 'black',
                    }}
                    disabled={loading}
                >
                    Do Inference
                </Button>
                {loading && (
                    <Box mt={2}>
                        <CircularProgress/>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Edit;