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
    TextField, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
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
    const letters = new Set([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ]);

    if (letters.has(event.key)) {
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
        {id: 'unit', value: '', save: false, msgSave: ''},
        {id: 1, value: ''},
    ]);

    const [unitQuery, setUnitQuery] = useState('');
    const [numberTableEdit, setNumberTableEdit] = useState<any>(0);
    const [loading, setLoading] = useState(false);
    const [emoInf, setEmoInf] = useState([]);


    let params = useParams();
    const temp = params.get("temp");
    const unitParam = params.get("unit");
    const editParam = params.get("edit");

    useEffect(() => {
        initialColumns = [
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
        if (unitParam !== null) {
            setLabels(prevLabels => {
                updateData('unit', unitParam)
                initialColumns = initialColumns.map(column => ({
                    ...column,
                    label: column.label.replace('Unit i', unitParam)
                }));
                return {...prevLabels, unit: unitParam};
            })

            setUnitQuery(unitParam)

            const tableEdit = []
            if (numberTableEdit !== 0) {
                for (let i = 0; i <= Number(numberTableEdit[0]['number']['value']); i++) {
                    tableEdit.push(
                        <TableEdit key={'edit_' + i} data={data} updateData={updateData} edit={editParam} temp={temp}
                                   idTableEdit={i} emoInf={emoInf}/>
                    )
                }
            }
            setTableEdits(tableEdit)
        } else {
            setLabels(prevLabels => {
                updateData('unit', '')
                return {...prevLabels, unit: 'Unit i'};
            })
        }
        // eslint-disable-next-line
    }, [numberTableEdit]);

    useEffect(() => {
        const fetchDataNumber = async () => {
            try {
                const query = `
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                    
                    SELECT ?number
                    WHERE {
                      ?individual rdfs:comment ?comment .
                      FILTER regex(?comment, "^${unitParam}_\\\\d+$")
                      BIND(xsd:integer(SUBSTR(?comment, STRLEN("${unitParam}_") + 1)) AS ?number)
                    }
                    ORDER BY DESC(?number)
                    LIMIT 1
                `;

                const response = await axios.get(variables.API_URL_GET, {
                    params: {
                        query,
                    },
                    headers: {
                        'Accept': 'application/sparql-results+json',
                    },
                });

                setNumberTableEdit(response.data['results']['bindings'])

            } catch (err) {
                console.log(err);
            }
        }

        fetchDataNumber().then()
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        setTableEdits(prevTableEdits =>
            prevTableEdits.map((edit, index) => (
                <TableEdit key={edit.key} data={data} updateData={updateData} edit={editParam} temp={temp}
                           idTableEdit={index} emoInf={emoInf}/>
            ))
        );
        // eslint-disable-next-line
    }, [data, emoInf]);

    useEffect(() => {
        if (data[0]['value'] !== '' && data[0]['value'] !== unitQuery) {
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

    const updateData = (id: any, newValue?: any, msgSave?: string) => {
        setData((prevData: any) => {
            if (id === 0) {
                return prevData.map((item: { msgSave: any; }, index: number) =>
                    index === 0
                        ? {
                            ...item,
                            save: false,
                            msgSave: msgSave ?? item.msgSave,
                        }
                        : item
                );
            } else {
                return prevData.map((item: { id: any; }) =>
                    item.id === id ? {...item, value: newValue} : item
                );
            }
        });
    };


    const [tableEdits, setTableEdits] = useState([<TableEdit key={0} data={data} updateData={updateData}
                                                             edit={editParam} temp={temp} idTableEdit={0}
                                                             emoInf={emoInf}/>]);

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
            <TableEdit key={prevTableEdits.length} data={data} updateData={updateData} edit={editParam} temp={temp}
                       emoInf={emoInf}/>
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
                                <Tooltip title={<span style={{fontSize: '1.2em'}}>Unit Title</span>} placement="top" arrow>
                                    <Button variant="outlined" style={{textTransform: 'none'}}
                                            onDoubleClick={(e) => {
                                                if (inputs[col.dataKey] !== undefined || unitQuery !== '') {
                                                    handleClick(e, col.dataKey);
                                                }
                                            }}
                                            onClick={(e) => {
                                                if (inputs[col.dataKey] === undefined && unitQuery === '') {
                                                    handleClick(e, col.dataKey);
                                                }
                                            }}
                                            sx={{m: 1}}>
                                        {labels[col.dataKey]}
                                    </Button>
                                </Tooltip>
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

            setEmoInf(response.data['results']['bindings']);
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
                                    <TextField id="Title" label="Drammar Title" variant="standard"/>
                                </TableCell>
                            </TableRow>
                            {header()}
                        </TableHead>
                        {tableEdits}
                    </Table>
                </TableContainer>
            </Paper>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
                <Tooltip title={<span style={{fontSize: '1.2em'}}>Add new Minimal Calculation Space</span>}
                         placement="top"
                         arrow>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={addTableEdit}
                    >
                        <AddIcon/>
                    </Button>
                </Tooltip>
            </div>
            <Box display="flex" justifyContent="center" mt={5} gap={2}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon/>}
                    onClick={() => {
                        setData(prevData => {
                            const newData = [...prevData];
                            // @ts-ignore
                            newData[0] = {...newData[0], save: true};
                            return newData;
                        });
                    }}
                >
                    Save
                </Button>
                {data[0]['save'] && (
                    <Box mt={2}>
                        <CircularProgress/>
                    </Box>
                )}
                <Button
                    variant="contained"
                    onClick={handleClickInference}
                    startIcon={<SaveIcon/>}
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