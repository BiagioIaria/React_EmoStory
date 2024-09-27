import React, {useEffect, useState} from 'react';
import TableEdit from "./TableEdit";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControlLabel,
    Input,
    Menu,
    MenuItem,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TextField,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
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
        {id: 'unit', value: '', save: false, msgSave: '', tripleExtra: ''},
        {id: 1, value: ''},
    ]);

    const [unitQuery, setUnitQuery] = useState('');
    const [numberTableEdit, setNumberTableEdit] = useState<any>(0);
    const [loading, setLoading] = useState(false);
    const [loadingExp, setLoadingExp] = useState(false);
    const [emoInf, setEmoInf] = useState([]);
    const [drammarSynopsis, setDrammarSynopsis] = useState('');
    const [unitSynopsis, setUnitSynopsis] = useState('');
    const [drammarTitle, setDrammarTitle] = useState('');
    const [objectData, setObjectData] = useState([]);
    const [footerAgentLabel, setFooterAgentLabel] = useState([]);


    let params = useParams();
    const temp = params.get("temp");
    const unitParam = params.get("unit");
    const editParam = params.get("edit");

    function setFooterLabel(ris: any) {
        const elabData = ris.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return {
                ao: item['entityName']?.['value'] ?? null,
                likes: item['likes']?.['value'] ?? null,
                dislikes: item['dislikes']?.['value'] ?? null,
                pleasure: item['pleasantSample']?.['value'] ?? null
            };
        });
        setFooterAgentLabel(elabData)
        const obj: any = []
        for (let i = 0; i < elabData.length; i++) {
            const likesArray = (String(elabData[i]['likes']).split(',').map((s: string) => s.trim()))
            for (let j = 0; j < likesArray.length; j++) {
                if (likesArray[j] === "undefined") {
                    obj.push(elabData[i]['ao'])
                }
            }
            const dislikesArray = (String(elabData[i]['dislikes']).split(',').map((s: string) => s.trim()))
            for (let j = 0; j < dislikesArray.length; j++) {
                if (dislikesArray[j] === "undefined") {
                    obj.push(elabData[i]['ao'])
                }
            }
        }

        setObjectData(Array.from(new Set(obj)))
    }

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
                label: 'Unit i Title',
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
                return {...prevLabels, unit: 'Unit i Title'};
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
                      FILTER regex(?comment, "^${unitParam}#\\\\d+$")
                      BIND(xsd:integer(SUBSTR(?comment, STRLEN("${unitParam}#") + 1)) AS ?number)
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

        const fetchDataAnnotations = async () => {
            try {
                const query = `
                    PREFIX dc: <http://purl.org/dc/elements/1.1/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX : <http://www.purl.org/drammar#>
                    
                    SELECT ?description1 (STRAFTER(STR(?v), "#") AS ?Vocabulary) ?description2
                    WHERE {
                      OPTIONAL {
                        :${unitParam} dc:description ?description1 .
                      }
                    
                      OPTIONAL {
                        ?v rdf:type :Vocabulary .
                        ?v rdfs:comment "${unitParam}" .
                        OPTIONAL {
                            ?v dc:description ?description2 .
                          }
                      }
                    }
                `;

                const response = await axios.get(variables.API_URL_GET, {
                    params: {
                        query,
                    },
                    headers: {
                        'Accept': 'application/sparql-results+json',
                    },
                });

                if (response.data['results']['bindings'][0]['Vocabulary']) {
                    setDrammarTitle(response.data['results']['bindings'][0]['Vocabulary']['value'])
                }
                if (response.data['results']['bindings'][0]['description2']) {
                    setDrammarSynopsis(response.data['results']['bindings'][0]['description2']['value'])
                }
                if (response.data['results']['bindings'][0]['description1']) {
                    setUnitSynopsis(response.data['results']['bindings'][0]['description1']['value'])
                }


            } catch (err) {
                console.log(err);
            }
        }

        const fetchDataFooter = async () => {
            try {
                let query = `
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        
                        SELECT ?entityName
                               (GROUP_CONCAT(DISTINCT ?likeName; SEPARATOR=", ") AS ?likes)
                               (GROUP_CONCAT(DISTINCT ?dislikeName; SEPARATOR=", ") AS ?dislikes)
                               (SAMPLE(?pleasant) AS ?pleasantSample)
                        WHERE {
                          {
                            ?entity a :Object .
                          } UNION {
                            ?entity a :Agent .
                          }
                        
                          ?entity rdfs:comment ?comment .
                          FILTER regex(?comment, "^${unitParam}(#\\\\d+)?$", "i")
                          
                          BIND(REPLACE(STR(?entity), "^.*#(.+)$", "$1") AS ?entityName)
                        
                          OPTIONAL {
                            ?entity :likes ?like .
                            BIND(REPLACE(STR(?like), "^.*#(.+)$", "$1") AS ?likeName)
                          }
                          OPTIONAL {
                            ?entity :dislikes ?dislike .
                            BIND(REPLACE(STR(?dislike), "^.*#(.+)$", "$1") AS ?dislikeName)
                          }
                          OPTIONAL { ?entity :pleasant ?pleasant }
                        }
                        GROUP BY ?entityName
                       `;

                const response = await axios.get(variables.API_URL_GET, {
                    params: {
                        query,
                    },
                    headers: {
                        'Accept': 'application/sparql-results+json',
                    },
                });
                setFooterLabel(response.data['results']['bindings']);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchData = async () => {
            try {
                await fetchDataNumber()
                await fetchDataAnnotations()
                await fetchDataFooter()
            } catch (error) {
                console.error('Errore durante l\'aggiornamento dei dati:', error);
            }
        };

        if (unitParam) {
            fetchData().then();
        }
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
        if ((data[0]['value'] !== '' && data[0]['value'] !== unitQuery) || data[0]['save']) {
            const unit = data[0]['value'].replace(/ /g, '_')

            const uniqueAgents = new Set<string>();

            data.forEach((item: any) => {
                uniqueAgents.add(item.value.agentplan1);
                uniqueAgents.add(item.value.agentplan2);
            });

            let triple = ''
            const Agents = Array.from(uniqueAgents).filter(agent => agent !== undefined && agent !== "");
            for (let i = 0; i < footerAgentLabel.length; i++) {
                if (footerAgentLabel[i]['ao'] !== '' && !Agents.includes(footerAgentLabel[i]['ao'])) {
                    triple += `
                        :${footerAgentLabel[i]['ao']} rdf:type :Object.
                        :${footerAgentLabel[i]['ao']} rdfs:comment "${unit}" .
                    `
                }
            }

            for (let i = 0; i < footerAgentLabel.length; i++) {

                if (footerAgentLabel[i]['pleasure'] === 'True') {
                    triple += `
                        :${footerAgentLabel[i]['ao']} :pleasant true.   
                        
                        `
                } else if (footerAgentLabel[i]['pleasure'] === 'False') {
                    triple += `
                        :${footerAgentLabel[i]['ao']} :pleasant false.   
                        
                        `
                }

                const likesArray = (String(footerAgentLabel[i]['likes']).split(',').map((s: string) => s.trim()))

                for (let j = 0; j < likesArray.length; j++) {
                    if (likesArray[j] !== '') {
                        triple += `
                            :${footerAgentLabel[i]['ao']} :likes :${likesArray[j]}.   
                            
                            `
                    }
                }

                const dislikesArray = (String(footerAgentLabel[i]['dislikes']).split(',').map((s: string) => s.trim()))

                for (let j = 0; j < dislikesArray.length; j++) {
                    if (dislikesArray[j] !== '') {
                        triple += `
                            :${footerAgentLabel[i]['ao']} :dislikes :${dislikesArray[j]}.   
                            
                            `
                    }
                }

            }

            setData(prevData => {
                const newData = [...prevData];
                // @ts-ignore
                newData[0] = {...newData[0], tripleExtra: triple};
                return newData;
            });

            const fetchDataInsert = async () => {
                const prefixQuery = `
                PREFIX dc: <http://purl.org/dc/elements/1.1/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX : <http://www.purl.org/drammar#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                `
                try {
                    let tripleUnit

                    tripleUnit = `
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
                        :${unit} dc:description "${unitSynopsis}" .
                         
                        `;


                    if (drammarTitle !== '') {
                        tripleUnit += `
                        :${drammarTitle} rdf:type :Vocabulary .
                        :${drammarTitle} rdfs:comment "${unit}" .
                        :${drammarTitle} dc:description "${drammarSynopsis}" .
                        
                        `
                    }

                    const query = `${prefixQuery}
                                                   INSERT DATA {
                                                     ${tripleUnit}
                                                   }`;


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
                if (u !== '') {
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
                }
            };

            fetchDataDelete(unitQuery).then(
                () => fetchDataInsert().then(
                    () => setUnitQuery(data[0]['value'])
                )
            )

        }
        // eslint-disable-next-line
    }, [data[0]['value'], data[0]['save']]);

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
                return prevData.some((item: { id: any; }) => item.id === id)
                    ? prevData.map((item: { id: any; }) =>
                        item.id === id ? {...item, value: newValue} : item
                    )
                    : [...prevData, {id, value: newValue}];
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

    const headerTable = () => (
        <TableRow>
            {initialColumns.map((col) => {
                    if ('unit' !== col.dataKey) {
                        return (
                            <TableCell key={col.dataKey}
                                       style={{width: col.width, textAlign: "center"}}
                            >{col.label}</TableCell>
                        )
                    } else {
                        return (
                            <TableCell key={col.dataKey}
                                       style={{width: col.width, textAlign: "center"}}
                            ></TableCell>
                        )
                    }
                }
            )}
        </TableRow>
    );

    useEffect(() => {
        if (!data[0].save && loading) {
            executeInferenceAfterSave().then();
        }
        // eslint-disable-next-line
    }, [data[0].save, loading]);

    useEffect(() => {
        if (!data[0].save && loadingExp) {
            executeExportAfterSave().then();
        }
        // eslint-disable-next-line
    }, [data[0].save, loadingExp]);

    const handleClickSaveAndInference = async () => {
        setLoading(true);
        setData(prevData => {
            const newData = [...prevData];
            // @ts-ignore
            newData[0] = {...newData[0], save: true};
            return newData;
        });

        await new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (!data[0].save) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        });
    };

    const executeInferenceAfterSave = async () => {
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

    const handleClickSaveAndExport = async () => {
        setLoadingExp(true);
        setData(prevData => {
            const newData = [...prevData];
            // @ts-ignore
            newData[0] = {...newData[0], save: true};
            return newData;
        });

        await new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (!data[0].save) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        });
    };

    const executeExportAfterSave = async () => {
        try {
            // Effettua la richiesta GET al tuo endpoint
            const response = await axios.get('http://localhost:8080/api/inference/export', {
                responseType: 'blob' // Questo è importante per gestire i dati binari
            });

            // Crea un URL per il file RDF
            const url = window.URL.createObjectURL(new Blob([response.data], {type: 'application/rdf+xml'}));

            // Crea un link per il download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'exported.rdf'); // Nome del file da scaricare

            // Aggiungi il link al DOM, cliccalo, e poi rimuovilo
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Errore durante l\'export del file:', error);
        } finally {
            setLoadingExp(false);
        }
    };

    const handleInputAgentsChange = (str: string, field: string, value: string) => {
        let label: any = footerAgentLabel.find((elem: any) => elem['ao'] === str);
        if (!label) {
            label = {ao: str}
        }

        let obj: any = []

        const uniqueAgents = new Set<string>();

        data.forEach((item: any) => {
            uniqueAgents.add(item.value.agentplan1);
            uniqueAgents.add(item.value.agentplan2);
        });

        const Agents = Array.from(uniqueAgents).filter(agent => agent !== undefined && agent !== "");

        function includesCaseInsensitive(arr: string[], val: string): boolean {
            return arr.map(el => el.toLowerCase()).includes(val.toLowerCase());
        }

        if (field === 'likes' || field === 'dislikes') {
            label[field] = value.split(',').map(s => s.trim());
            if (label['likes']) {
                label['likes'] = String(label['likes'])
            }
            if (label['dislikes']) {
                label['dislikes'] = String(label['dislikes'])
            }
            for (let i = 0; i < footerAgentLabel.length; i++) {
                let object1: any = []
                const arrayLike = String(footerAgentLabel[i]['likes']).split(',').map(s => s.trim());
                if (footerAgentLabel[i]['likes'] !== 'undefined' && footerAgentLabel[i]['likes'] !== '') {
                    object1 = arrayLike.filter((element: any) => !includesCaseInsensitive(Agents, element));
                }
                let object2: any = []
                const arrayDislike = String(footerAgentLabel[i]['dislikes']).split(',').map(s => s.trim());
                if (footerAgentLabel[i]['dislikes'] !== 'undefined' && footerAgentLabel[i]['dislikes'] !== '') {
                    object2 = arrayDislike.filter((element: any) => !includesCaseInsensitive(Agents, element));
                }
                obj = [...obj, ...object1, ...object2]
            }
        } else {
            label[field] = value;
        }
        setObjectData(Array.from(new Set(obj)))

        setFooterAgentLabel(prevArray => {
            const index = prevArray.findIndex((elem: any) => elem.ao === label.ao);

            if (index === -1) return prevArray;

            let newArray: any = [...prevArray];
            newArray[index] = label;

            obj.forEach((str: any) => {
                if (!newArray.some((elem: { ao: any; }) => elem.ao === str)) {
                    newArray.push({ao: str, likes: "undefined", dislikes: "undefined", pleasure: null});
                }
            });

            newArray = newArray.filter((elem: { likes: string; dislikes: string; ao: any; }) => {
                return !(elem.likes === "undefined" && elem.dislikes === "undefined" && !obj.includes(elem.ao));
            });

            return newArray;
        });
    };

    function createAgentFooterInput() {
        const uniqueAgents = new Set<string>();

        data.forEach((item: any) => {
            uniqueAgents.add(item.value.agentplan1);
            uniqueAgents.add(item.value.agentplan2);
        });

        const Agents = Array.from(uniqueAgents).filter(agent => agent !== undefined && agent !== "");
        return Agents.map((str: string, index: number) => {

            let label: any = footerAgentLabel.find((item: any) => item.ao === str);
            if (!label) {
                setFooterAgentLabel(prevArray => {
                    let newArray: any = [...prevArray];
                    newArray.push({ ao: str, likes: '', dislikes: '', pleasure: null })
                    return newArray;
                });
                label={ ao: str, likes: '', dislikes: '', pleasure: null }
            }

            let radioGroupValue = "null"
            if (label["pleasure"] !== null && label["pleasure"] !== "null") {
                radioGroupValue = label["pleasure"].charAt(0).toUpperCase() + label["pleasure"].slice(1)
            }

            return (
                <div key={str + index + 'Header'}>
                    <h3>{str}</h3>
                    <TextField
                        label="Likes"
                        variant="outlined"
                        value={label["likes"]}
                        onChange={(e) => handleInputAgentsChange(str, 'likes', e.target.value)}
                        InputProps={{style: {minWidth: 150}}}
                        style={{flex: '1 0 30%', marginRight: '10px'}}
                    />
                    <TextField
                        label="Dislikes"
                        variant="outlined"
                        value={label["dislikes"]}
                        onChange={(e) => handleInputAgentsChange(str, 'dislikes', e.target.value)}
                        InputProps={{style: {minWidth: 150}}}
                        style={{flex: '1 0 30%', marginRight: '10px'}}
                    />
                    <div style={{marginTop: 10}}>Pleasant?</div>
                    <RadioGroup row name={`Pleasant-${index}`} value={radioGroupValue}>
                        <FormControlLabel
                            value="True"
                            control={<Radio/>}
                            label="True"
                            onChange={() => handleInputAgentsChange(str, 'pleasure', "True")}
                        />
                        <FormControlLabel
                            value="False"
                            control={<Radio/>}
                            label="False"
                            onChange={() => handleInputAgentsChange(str, 'pleasure', "False")}
                        />
                        <FormControlLabel
                            value="null"
                            control={<Radio/>}
                            label="null"
                            onChange={() => handleInputAgentsChange(str, 'pleasure', "null")}
                        />
                    </RadioGroup>
                </div>
            )
        });
    }

    return (
        <div className='edit'>
            <Paper style={{display: 'flex', flexDirection: 'column', height: '57em'}}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                            <TableRow>
                                <TableCell align="center" colSpan={initialColumns.length}
                                           sx={{
                                               textAlign: 'center',
                                           }}>
                                    <TextField id="Title" label="Drammar Title" variant="standard"
                                               value={drammarTitle}
                                               onChange={(event) => setDrammarTitle(event.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" colSpan={initialColumns.length}
                                           sx={{
                                               textAlign: 'center',
                                           }}>
                                    <div style={{position: 'relative', width: '100%'}}>
                                        <span className="backgroundText">Synopsis Drammar</span>
                                        <TextField
                                            multiline
                                            rows={2}
                                            variant="outlined"
                                            style={{width: '55em'}}
                                            value={drammarSynopsis}
                                            onChange={(event) => setDrammarSynopsis(event.target.value)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell key={'unit'}
                                           align="center" colSpan={initialColumns.length}
                                           sx={{
                                               textAlign: 'center',
                                           }}
                                >
                                    <Tooltip title={<span style={{fontSize: '1.2em'}}>Unit Title</span>} placement="top"
                                             arrow>
                                        <Button variant="outlined" style={{textTransform: 'none'}}
                                                onDoubleClick={(e) => {
                                                    if (inputs['unit'] !== undefined || unitQuery !== '') {
                                                        handleClick(e, 'unit');
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    if (inputs['unit'] === undefined && unitQuery === '') {
                                                        handleClick(e, 'unit');
                                                    }
                                                }}
                                                sx={{m: 1}}>
                                            {labels['unit']}
                                        </Button>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorEls['unit']}
                                        open={Boolean(anchorEls['unit'])}
                                        onClose={() => handleClose('unit')}
                                    >
                                        <MenuItem>
                                            <Input
                                                placeholder="Unit"
                                                value={inputs['unit']?.input || ''}
                                                onChange={(e) => handleInputChange('unit', 'input', e.target.value)}
                                                fullWidth
                                                onKeyDown={handleKeyDown}
                                            />
                                        </MenuItem>
                                        <MenuItem>
                                            <Button variant="contained" onClick={() => handleConfirm('unit')}>
                                                Confirm
                                            </Button>
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell key={'Synopsis Unit'} align="center" colSpan={initialColumns.length}
                                           sx={{
                                               textAlign: 'center',
                                           }}>
                                    <div style={{position: 'relative', width: '100%'}}>
                                        <span className="backgroundText">Synopsis Unit</span>
                                        <TextField
                                            multiline
                                            rows={2}
                                            variant="outlined"
                                            style={{width: '55em'}}
                                            value={unitSynopsis}
                                            onChange={(event) => setUnitSynopsis(event.target.value)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                            {headerTable()}
                        </TableHead>
                        <TableBody>
                            {tableEdits.reduce((acc: any, current, index) => {
                                if (index < tableEdits.length - 1) {
                                    return [
                                        ...acc,
                                        current,
                                        <TableRow key={'TableCell_' + index}>
                                            <TableCell colSpan={initialColumns.length} sx={{p: 0}}>
                                                <Divider key={`divider-${index}`} sx={{
                                                    borderColor: 'primary.main',
                                                    borderWidth: 3,
                                                    my: 2,
                                                    width: '100%',
                                                }}/>
                                            </TableCell>
                                        </TableRow>
                                    ];
                                } else {
                                    return [...acc, current];
                                }
                            }, [])}
                        </TableBody>
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
            {createAgentFooterInput()}
            <Divider/>
            <h3>Object Pleasant</h3>
            {objectData.map((item, index) => {
                const label: any = footerAgentLabel.find((elem: any) => elem['ao'] === item);
                if (label) {
                    let radioGroupValue = "null"
                    if (label["pleasure"] !== null && label["pleasure"] !== "null") {
                        radioGroupValue = label["pleasure"].charAt(0).toUpperCase() + label["pleasure"].slice(1)
                    }
                    return (
                        item !== '' && (
                            <div key={index} style={{marginTop: 10}}>
                                <div>{item} Pleasant?</div>
                                <RadioGroup row name={`Pleasant-${index}`} value={radioGroupValue}>
                                    <FormControlLabel
                                        value="True"
                                        control={<Radio/>}
                                        label="True"
                                        onChange={() => handleInputAgentsChange(item, 'pleasure', 'True')}
                                    />
                                    <FormControlLabel
                                        value="False"
                                        control={<Radio/>}
                                        label="False"
                                        onChange={() => handleInputAgentsChange(item, 'pleasure', 'False')}
                                    />
                                    <FormControlLabel
                                        value="null"
                                        control={<Radio/>}
                                        label="null"
                                        onChange={() => handleInputAgentsChange(item, 'pleasure', 'null')}
                                    />
                                </RadioGroup>
                            </div>
                        )
                    )
                } else {
                    return <></>
                }
            })}
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
                    onClick={handleClickSaveAndInference}
                    startIcon={<SaveIcon/>}
                    style={{
                        backgroundColor: 'lightyellow',
                        color: 'black',
                    }}
                    disabled={loading}
                >
                    Save and Do Inference
                </Button>
                {loading && (
                    <Box mt={2}>
                        <CircularProgress/>
                    </Box>
                )}
                <Button
                    variant="contained"
                    onClick={handleClickSaveAndExport}
                    startIcon={<DownloadIcon/>}
                    color="primary"
                    disabled={loadingExp}
                >
                    Save and Export rdf
                </Button>
                {loadingExp && (
                    <Box mt={2}>
                        <CircularProgress/>
                    </Box>
                )}
            </Box>

        </div>
    );
}

export default Edit;