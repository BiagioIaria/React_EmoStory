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
    const [emotion, setEmotion] = useState([]);

    function setEmotionQuery(data: any) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Emotion']['value'];
        });
        setEmotion(elabData);
    }

    function setUnitLabel(data: any, type: string) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item[type]['value'];
        });

        setLabels(prevLabels => {
            if (type === 'Plan') {
                const elabDataAcc = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                    if (item['a']['value'] === 'true') {
                        return 'Accomplished'
                    } else {
                        return 'Unaccomplished'
                    }
                });
                const elabDataCon = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                    if (item['Conflict']['value'] === 'inConflictWith') {
                        return 'Conflict'
                    } else {
                        return 'Conflict?'
                    }
                });

                const elabDataSup = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                    if (item['Conflict']['value'] === 'inSupportOf') {
                        return 'Support'
                    } else {
                        return 'Support?'
                    }
                });

                return {
                    ...prevLabels,
                    plan1: elabData[0],
                    plan2: elabData[1],
                    accplan1: elabDataAcc[0],
                    accplan2: elabDataAcc[1],
                    conflict: elabDataCon[0],
                    dxSupport: elabDataSup[0],
                    sxSupport: elabDataSup[1]
                };
            } else if (type === 'Goal') {
                return {
                    ...prevLabels,
                    goalplan1: elabData[0],
                    goalplan2: elabData[1],

                };
            } else if (type === 'Agent') {
                return {
                    ...prevLabels,
                    agentplan1: elabData[0],
                    agentplan2: elabData[1],

                };
            }
        })

        setQueryLabels(prevLabels => {
            if (type === 'Plan') {
                const elabDataAcc = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                    if (item['a']['value'] === 'true') {
                        return 'Accomplished'
                    } else {
                        return 'Unaccomplished'
                    }
                });
                const elabDataCon = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                    if (item['Conflict']['value'] === 'inConflictWith') {
                        return 'Conflict'
                    } else {
                        return ''
                    }
                });
                const elabDataSup = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                    if (item['Conflict']['value'] === 'inSupportOf') {
                        return 'Support'
                    } else {
                        return ''
                    }
                });
                return {
                    ...prevLabels,
                    plan1: elabData[0],
                    plan2: elabData[1],
                    accplan1: elabDataAcc[0],
                    accplan2: elabDataAcc[1],
                    conflict: elabDataCon[0],
                    dxSupport: elabDataSup[0],
                    sxSupport: elabDataSup[1]
                };
            } else if (type === 'Goal') {
                return {
                    ...prevLabels,
                    goalplan1: elabData[0],
                    goalplan2: elabData[1],

                };
            } else if (type === 'Agent') {
                return {
                    ...prevLabels,
                    agentplan1: elabData[0],
                    agentplan2: elabData[1],

                };
            }
        })
    }

    useEffect(() => {
        const unitParam = params.data[0]['value']
        const editParam = params.edit

        if (unitParam !== '' && editParam === '1') {
            const fetchData = async (type: string) => {
                const comment = unitParam + '_' + params.idTableEdit
                try {
                    let query = ``
                    if (type === 'Plan') {
                        query = `
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        
                        SELECT (STRAFTER(STR(?p), "#")AS ?Plan) ?a (STRAFTER(STR(?s), "#")AS ?Conflict)
                        WHERE {
                            ?p rdf:type :Plan .
                            ?p2 rdf:type :Plan .
                            ?p :accomplished ?a .
                            ?p ?s ?p2 .
                            ?p rdfs:comment "Unit_Box_0" .
                            ?p2 rdfs:comment "Unit_Box_0" .
                        }
                        `;
                    } else if (type === 'Goal') {
                        query = `
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        
                        SELECT (STRAFTER(STR(?g), "#")AS ?Goal)
                        WHERE {
                          ?g rdf:type :Goal .
                          ?g rdfs:comment "${comment}" .
                        }
                        `;
                    } else if (type === 'Agent') {
                        query = `
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        
                        SELECT (STRAFTER(STR(?a), "#")AS ?Agent)
                        WHERE {
                          ?a rdf:type :Agent .
                          ?a rdfs:comment "${comment}" .
                        }
                        `;
                    }

                    const response = await axios.get(variables.API_URL_GET, {
                        params: {
                            query,
                        },
                        headers: {
                            'Accept': 'application/sparql-results+json',
                        },
                    });
                    setUnitLabel(response.data['results']['bindings'], type);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchData('Plan').then(
                () => fetchData('Goal').then(
                    () => fetchData('Agent').then()
                )
            )
        }
        // eslint-disable-next-line
    }, [params.data[0]['value']]);

    useEffect(() => {
        const fetchDataEmo = async () => {
            try {
                const query = `
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX : <http://www.purl.org/drammar#>
                    
                    SELECT (STRAFTER(STR(?individuo), "#")AS ?Emotion)
                    WHERE {
                      ?individuo rdf:type :ExternalRefEmotionType .
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
                setEmotionQuery(response.data['results']['bindings']);
            } catch (err) {
                console.log(err);
            }
        };
        fetchDataEmo().then()
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const partValid = Object.values(queryLabels).slice(0, 8).every((value: string) => value !== '');

        const prefixQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.purl.org/drammar#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        `

        if (params.data[0]['value'] !== ''
            && partValid
            && Object.values(queryLabels).some(value => value === "Support" || value === "Conflict")
            && params.data[0]['save'] === true) {
            const unit = params.data[0].value.replace(/ /g, '_')
            const plan1 = queryLabels['plan1'].replace(/ /g, '_')
            const plan2 = queryLabels['plan2'].replace(/ /g, '_')
            const goal1 = queryLabels['goalplan1'].replace(/ /g, '_')
            const goal2 = queryLabels['goalplan2'].replace(/ /g, '_')
            const agent1 = queryLabels['agentplan1'].replace(/ /g, '_')
            const agent2 = queryLabels['agentplan2'].replace(/ /g, '_')
            const comment = unit + '_' + params['idTableEdit']


            const fetchDataInsert = async (t: string) => {
                try {
                    let query

                    if (t === 'Plan') {
                        conflict = ''
                        accomplished1 = ''
                        accomplished2 = ''
                        if (queryLabels['accplan1'] === 'Accomplished') {
                            accomplished1 = `:${plan1} :accomplished true .`
                        } else {
                            accomplished1 = `:${plan1} :accomplished false .`
                        }
                        if (queryLabels['accplan2'] === 'Accomplished') {
                            accomplished2 = `:${plan2} :accomplished true .`
                        } else {
                            accomplished2 = `:${plan2} :accomplished false .`
                        }
                        if (queryLabels['conflict'] !== '') {
                            conflict =
                                `:${plan1} :inConflictWith :${plan2} .
                                 :${plan2} :inConflictWith :${plan1} .`
                        } else {
                            if (queryLabels['sxSupport'] === '') {
                                conflict = `:${plan1} :inSupportOf :${plan2} .`
                            } else if (queryLabels['dxSupport'] === '') {
                                conflict = `:${plan2} :inSupportOf :${plan1} .`
                            } else {
                                conflict =
                                    `:${plan1} :inSupportOf :${plan2} .
                                     :${plan2} :inSupportOf :${plan1} .`
                            }
                        }
                        const triplePlan = `
                            :${plan1} rdf:type :DirectlyExecutablePlan.
                            :${plan1} rdfs:comment "${comment}" .
                            :${plan2} rdf:type :DirectlyExecutablePlan.
                            :${plan2} rdfs:comment "${comment}" .
                            :precondition_${plan1} rdf:type :ConsistentStateSet.
                            :precondition_${plan1} rdfs:comment "${comment}" .
                            :precondition_${plan1} :isPlanPreconditionOf :${plan1}.
                            :effect_${plan1} rdf:type :ConsistentStateSet.
                            :effect_${plan1} rdfs:comment "${comment}" .
                            :effect_${plan1} :isPlanEffectOf :${plan1}.
                            :precondition_${plan2} rdf:type :ConsistentStateSet.
                            :precondition_${plan2} rdfs:comment "${comment}" .
                            :precondition_${plan2} :isPlanPreconditionOf :${plan2}.
                            :effect_${plan2} rdf:type :ConsistentStateSet.
                            :effect_${plan2} rdfs:comment "${comment}" .
                            :effect_${plan2} :isPlanEffectOf :${plan2} .
                            :${plan1} :isMotivationFor :Timeline_${unit} .
                            :${plan2} :isMotivationFor :Timeline_${unit} .
                            ${conflict}
                            ${accomplished1}
                            ${accomplished2}
                        `

                        const sendBatchQuery = async (batch: string) => {
                            const query = `${prefixQuery}
                                                   INSERT DATA {
                                                     ${batch}
                                                   }`;
                            await axios.post(variables.API_URL_POST, query, {
                                headers: {
                                    'Content-Type': 'application/sparql-update'
                                }
                            });
                        }

                        const BATCH_SIZE = 4;
                        const triples = triplePlan.split('\n'); // Divide le triple per riga
                        for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                            const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                            await sendBatchQuery(batch);
                        }

                    } else if (t === 'Goal') {

                        query = `${prefixQuery}
                          INSERT DATA {
                            :${goal1} rdf:type :Goal.
                            :${goal1} rdfs:comment "${comment}" .
                            :${goal1}_schema rdf:type :GoalSchema.
                            :${goal1}_schema rdfs:comment "${comment}" .
                            :${goal1}_schema :describes :${goal1} .
                            :${goal2} rdf:type :Goal.
                            :${goal2} rdfs:comment "${comment}" .
                            :${goal2}_schema rdf:type :GoalSchema.
                            :${goal2}_schema rdfs:comment "${comment}" .
                            :${goal2}_schema :describes :${goal2} .
                            :${goal1} :isAchievedBy :${plan1} .
                            :${goal2} :isAchievedBy :${plan2} .
                          }
                        `;

                        await axios.post(variables.API_URL_POST, query, {
                            headers: {
                                'Content-Type': 'application/sparql-update'
                            }
                        });
                    } else if (t === 'Agent') {

                        query = `${prefixQuery}
                          INSERT DATA {
                            :${agent1} rdf:type :Agent.
                            :${agent1} rdfs:comment "${comment}" .
                            :${agent2} rdf:type :Agent.
                            :${agent2} rdfs:comment "${comment}" .
                            :${agent1} :hasGoal :${goal1}.
                            :${agent2} :hasGoal :${goal2}.
                            :${agent1} :intends :${plan1}.
                            :${agent2} :intends :${plan2}.
                          }
                        `;

                        await axios.post(variables.API_URL_POST, query, {
                            headers: {
                                'Content-Type': 'application/sparql-update'
                            }
                        });
                    } else if (t === 'Emotion') {

                        let tripleEmo = ''
                        emotion.forEach((elem) => {
                            tripleEmo = tripleEmo +
                                `:${elem}_${agent1} rdf:type :Emotion.
                                 :${elem}_${agent2} rdf:type :Emotion.
                                 :${elem}_${agent1} rdfs:comment "${comment}" .
                                 :${elem}_${agent2} rdfs:comment "${comment}" .
                                 :${elem}_${agent1} :isEmotionOf :${agent1}
                                 :${elem}_${agent2} :isEmotionOf :${agent2}
                                 :${elem}_ES rdf:type :EmotionSchema.
                                 :${elem}_ES rdfs:comment "${comment}" .
                                 :${elem}_ES :hasEmotionType :${elem}
                                 :${elem}_ES :describes :${elem}_${agent1}
                                 :${elem}_ES :describes :${elem}_${agent2}
                                 
                                 `
                        })

                        query = `${prefixQuery}
                          INSERT DATA {
                            ${tripleEmo}
                          }
                        `;

                        await axios.post(variables.API_URL_POST, query, {
                            headers: {
                                'Content-Type': 'application/sparql-update'
                            }
                        });

                    } else if (t === 'Value') {

                        let tripleValue = '';

                        const generateTriples = (values: any[], agent: any, p: any) => {
                            values.forEach((elem) => {

                                tripleValue += `
                                :${elem['value']}_atStake rdf:type :Value.
                                :${elem['value']}_atStake :atStake true.
                                :${elem['value']}_atStake rdfs:comment "${comment}".
                                :${elem['value']}_atStake :isValueEngagedOf :${agent}.
                                :${elem['value']}_inBalance rdf:type :Value.
                                :${elem['value']}_inBalance :atStake false.
                                :${elem['value']}_inBalance rdfs:comment "${comment}".
                                :${elem['value']}_inBalance :isValueEngagedOf :${agent}.
                                :${elem['value']}_schema rdf:type :ValueSchema.
                                :${elem['value']}_schema rdfs:comment "${comment}".
                                :${elem['value']}_schema :describes :${elem['value']}_atStake.
                                :${elem['value']}_schema :describes :${elem['value']}_inBalance.
                                :Precondition_${unit}_${elem['value']}_${elem['balPreUnit']} rdf:type :SetMember.
                                :Precondition_${unit}_${elem['value']}_${elem['balPreUnit']} rdfs:comment "${comment}".
                                :Precondition_${unit}_${elem['value']}_${elem['balPreUnit']} :hasData :${elem['value']}_${elem['balPreUnit']}.
                                :Precondition_${unit}_${elem['value']}_${elem['balPreUnit']} :isMemberOf :Precondition_${unit}.
                                :Precondition_${p}_${elem['value']}_${elem['balPre']} rdf:type :SetMember.
                                :Precondition_${p}_${elem['value']}_${elem['balPre']} rdfs:comment "${comment}".
                                :Precondition_${p}_${elem['value']}_${elem['balPre']} :hasData :${elem['value']}_${elem['balPre']}.
                                :Precondition_${p}_${elem['value']}_${elem['balPre']} :isMemberOf :precondition_${p}.
                                :Effect_${p}_${elem['value']}_${elem['balEff']} rdf:type :SetMember.
                                :Effect_${p}_${elem['value']}_${elem['balEff']} rdfs:comment "${comment}".
                                :Effect_${p}_${elem['value']}_${elem['balEff']} :hasData :${elem['value']}_${elem['balEff']}.
                                :Effect_${p}_${elem['value']}_${elem['balEff']} :isMemberOf :effect_${p}.
                            `;
                            });
                        }

                        generateTriples(value_1, agent1, plan1);
                        generateTriples(value_2, agent2, plan2);


                        const sendBatchQuery = async (batch: string) => {
                            const query = `${prefixQuery}
                                                   INSERT DATA {
                                                     ${batch}
                                                   }`;
                            await axios.post(variables.API_URL_POST, query, {
                                headers: {
                                    'Content-Type': 'application/sparql-update'
                                }
                            });
                        }

                        const BATCH_SIZE = 4;
                        const triples = tripleValue.split('\n'); // Divide le triple per riga
                        for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                            const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                            await sendBatchQuery(batch);
                        }
                    }

                } catch (err) {
                    console.error(err);
                }
            };

            const fetchDataDelete = async () => {
                try {
                    // Prima query: cancellazione del commento se ci sono altri commenti
                    const deleteCommentQuery = `
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            
                        DELETE {
                          ?individual rdfs:comment "${comment}" .
                        }
                        WHERE {
                          ?individual rdfs:comment "${comment}" .
                          FILTER(EXISTS { ?individual rdfs:comment ?otherComment . FILTER(?otherComment != "${comment}") })
                        }
                    `;

                    const deleteCommentResponse = await axios.post(variables.API_URL_POST, deleteCommentQuery, {
                        headers: {
                            'Content-Type': 'application/sparql-update'
                        }
                    });

                    // Se la prima query non ha cancellato nulla, esegui la seconda query
                    if (!deleteCommentResponse.data.includes("deleted")) {
                        const deleteIndividualQuery = `
                            PREFIX : <http://www.purl.org/drammar#>
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            
                            DELETE {
                              ?individual ?p ?o .
                              ?s ?p2 ?individual .
                            }
                            WHERE {
                              ?individual rdfs:comment "${comment}" .
                              FILTER(NOT EXISTS { ?individual rdfs:comment ?otherComment . FILTER(?otherComment != "${comment}") })
                              OPTIONAL {
                                ?individual ?p ?o .
                              }
                              OPTIONAL {
                                ?s ?p2 ?individual .
                              }
                            }
                        `;

                        await axios.post(variables.API_URL_POST, deleteIndividualQuery, {
                            headers: {
                                'Content-Type': 'application/sparql-update'
                            }
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            };

            let accomplished1: any = queryLabels['accplan1'] === 'Accomplished';
            let accomplished2: any = queryLabels['accplan2'] === 'Accomplished';

            let conflict = ''
            if (queryLabels['conflict'] !== '') {
                conflict = queryLabels['conflict']

            } else {
                conflict = queryLabels['sxSupport'] + '_' + queryLabels['dxSupport']

            }

            const value_1: any[] = []
            const regexPlan1 = /^value\d+_plan1$/;

            for (const key in queryLabels) {
                const match = regexPlan1.exec(key);
                if (match) {
                    const number = match[0][5];
                    const balPreKey = `balPre${number}_plan1`;
                    const balEffKey = `balEff${number}_plan1`;
                    const balPreUnitKey = `balPreUnit${number}_preUnit`;

                    if (queryLabels.hasOwnProperty(balPreKey) && queryLabels.hasOwnProperty(balEffKey) && queryLabels.hasOwnProperty(balPreUnitKey)) {
                        value_1.push({
                            value: queryLabels[key],
                            balPre: queryLabels[balPreKey],
                            balEff: queryLabels[balEffKey],
                            balPreUnit: queryLabels[balPreUnitKey]
                        });
                    }
                }
            }

            const value_2: any[] = []
            const regexPlan2 = /^value\d+_plan2$/;

            for (const key in queryLabels) {
                const match = regexPlan2.exec(key);
                if (match) {
                    const number = match[0][5];
                    const balPreKey = `balPre${number}_plan2`;
                    const balEffKey = `balEff${number}_plan2`;
                    const balPreUnitKey = `balPreUnit${number}_preUnit`;

                    if (queryLabels.hasOwnProperty(balPreKey) && queryLabels.hasOwnProperty(balEffKey) && queryLabels.hasOwnProperty(balPreUnitKey)) {
                        value_2.push({
                            value: queryLabels[key],
                            balPre: queryLabels[balPreKey],
                            balEff: queryLabels[balEffKey],
                            balPreUnit: queryLabels[balPreUnitKey]
                        });
                    }
                }
            }

            if (Object.values(triplesQuery).length === 0) {

                setTriplesQuery(
                    {
                        Unit: unit,
                        Plan1: plan1,
                        Plan2: plan2,
                        Accomplished1: accomplished1,
                        Accomplished2: accomplished2,
                        Conflict: conflict,
                        Goal1: goal1,
                        Goal2: goal2,
                        Agent1: agent1,
                        Agent2: agent2,
                        Value1: value_1,
                        Value2: value_2
                    }
                )

                fetchDataInsert('Plan').then(
                    () => fetchDataInsert('Goal').then(
                        () => fetchDataInsert('Agent').then(
                            () => fetchDataInsert('Emotion').then(
                                () => fetchDataInsert('Value').then()
                            )
                        )
                    )
                );
            } else {
                fetchDataDelete().then(
                    () => fetchDataInsert('Plan').then(
                        () => fetchDataInsert('Goal').then(
                            () => fetchDataInsert('Agent').then(
                                () => fetchDataInsert('Emotion').then(
                                    () => fetchDataInsert('Value').then()
                                )
                            )
                        )
                    )
                )

                setTriplesQuery(
                    {
                        Unit: unit,
                        Plan1: plan1,
                        Plan2: plan2,
                        Accomplished1: accomplished1,
                        Accomplished2: accomplished2,
                        Conflict: conflict,
                        Goal1: goal1,
                        Goal2: goal2,
                        Agent1: agent1,
                        Agent2: agent2,
                        Value1: value_1,
                        Value2: value_2
                    }
                )

            }
            params.updateData(0)
            params.updateData(params.idTableEdit + 1, triplesQuery)
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
                                    disabled={labels['acc' + keyLabel] === 'accomplished?' && inputs[keyLabel] === undefined}
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
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" style={{marginRight: 8}}>
                                        P Agent {keyLabel[keyLabel.length - 1]}
                                    </Typography>
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
                                </Box>
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
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" style={{marginRight: 8}}>
                                        G Plan Agent {keyLabel[keyLabel.length - 1]}
                                    </Typography>
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
                                </Box>
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
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" style={{marginRight: 8}}>
                                        Agent {keyLabel[keyLabel.length - 1]}
                                    </Typography>
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
                                </Box>
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
                                    disabled={(inputs['plan1'] === undefined || inputs['plan2'] === undefined) && (labels['conflict'] === 'Conflict?' && labels['dxSupport'] === 'Support?' && labels['sxSupport'] === 'Support?')}
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
                                    disabled={(inputs['plan1'] === undefined || inputs['plan2'] === undefined) && (labels['conflict'] === 'Conflict?' && labels['dxSupport'] === 'Support?' && labels['sxSupport'] === 'Support?')}
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
                                    disabled={(inputs['plan1'] === undefined || inputs['plan2'] === undefined) && (labels['conflict'] === 'Conflict?' && labels['dxSupport'] === 'Support?' && labels['sxSupport'] === 'Support?')}
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