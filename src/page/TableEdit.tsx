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
    Tooltip,
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
    const [agentEmotionInf, setAgentEmotionInf] = useState<any>([]);

    function setEmotionQuery(data: any) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Emotion']['value'];
        });
        setEmotion(elabData);
    }

    function setUnitLabel(data: any) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Plan']?.['value'] ?? null;
        });

        const elabDataGoal = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Goal']?.['value'] ?? null;
        })

        const elabDataAgent = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Agent']?.['value'] ?? null;
        })

        const elabDataValue = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            let states = []
            let statesQuery = item['States']['value'].split(", ")
            let values = item['Values']['value'].split(", ")
            for (let i = 0; i < values.length; i++) {
                const s = statesQuery.filter((str: string | string[]) => str.includes(values[i]))
                states.push({value: values[i], s: s})
            }
            return {agent: item['Agent']?.['value'] ?? null, values: values, states: states};
        })

        function findString(data: any[], targetValue: string, searchString: string): string | null {
            const targetObject = data.find(item => item.value === targetValue);
            if (!targetObject) {
                return null;
            }

            const targetString = targetObject.s.find((str: string) => str.includes(searchString));
            if (!targetString) {
                return null;
            }

            const lastUnderscoreIndex = targetString.lastIndexOf('_');
            if (lastUnderscoreIndex === -1) {
                return null;
            }

            return targetString.substring(lastUnderscoreIndex + 1);
        }

        let g = [3]
        let value1 = {}
        let value2 = {}
        if (elabDataValue[1]) {
            for (let j = 0; j < elabDataValue[1]['values'].length; j++) {
                if (elabDataValue[1]['values'][j] !== '') {
                    const index = j + elabDataValue[0]['values'].length
                    const preUnit = findString(
                        elabDataValue[1]['states'],
                        elabDataValue[1]['values'][j],
                        `Precondition_${params.data[0]['value']}_${elabDataValue[1]['values'][j]}_`
                    )

                    const prePlan = findString(
                        elabDataValue[1]['states'],
                        elabDataValue[1]['values'][j],
                        `Precondition_${elabData[1]}_${elabDataValue[1]['values'][j]}_`
                    )

                    const effPlan = findString(
                        elabDataValue[1]['states'],
                        elabDataValue[1]['values'][j],
                        `Effect_${elabData[1]}_${elabDataValue[1]['values'][j]}_`
                    )
                    value2 = {
                        ...value2,
                        ['value' + index + '_plan2']: elabDataValue[1]['values'][j],
                        ['balEff' + index + '_plan2']: effPlan,
                        ['balPre' + index + '_plan2']: prePlan,
                        ['balPreUnit' + index + '_preUnit']: preUnit,
                    }
                    g.unshift(2)
                }
            }
        }
        if (elabDataValue[0]) {
            for (let j = 0; j < elabDataValue[0]['values'].length; j++) {
                if (elabDataValue[0]['values'][j] !== '') {
                    const preUnit = findString(
                        elabDataValue[0]['states'],
                        elabDataValue[0]['values'][j],
                        `Precondition_${params.data[0]['value']}_${elabDataValue[0]['values'][j]}_`
                    )

                    const prePlan = findString(
                        elabDataValue[0]['states'],
                        elabDataValue[0]['values'][j],
                        `Precondition_${elabData[0]}_${elabDataValue[0]['values'][j]}_`
                    )

                    const effPlan = findString(
                        elabDataValue[0]['states'],
                        elabDataValue[0]['values'][j],
                        `Effect_${elabData[0]}_${elabDataValue[0]['values'][j]}_`
                    )
                    value1 = {
                        ...value1,
                        ['value' + j + '_plan1']: elabDataValue[0]['values'][j],
                        ['balEff' + j + '_plan1']: effPlan,
                        ['balPre' + j + '_plan1']: prePlan,
                        ['balPreUnit' + j + '_preUnit']: preUnit,
                    }
                    g.unshift(1)
                }
            }
        }
        setGroups(g)
        setLabels(prevLabels => {

            const elabDataAcc = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                if (item['a'] !== undefined && item['a']['value'] === 'true') {
                    return 'Accomplished'
                } else if (item['a'] !== undefined && item['a']['value'] === 'false') {
                    return 'Unaccomplished'
                } else {
                    return 'accomplished?'
                }
            });

            const elabDataCon = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                if (item['Conflict'] !== undefined && item['Conflict']['value'] === 'inConflictWith') {
                    return 'Conflict'
                } else {
                    return 'Conflict?'
                }
            });


            const elabDataSup = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                if (item['Conflict'] !== undefined && item['Conflict']['value'] === 'inSupportOf') {
                    return 'Support'
                } else {
                    return 'Support?'
                }
            });

            type ValueType = Record<string, any>;

            function transformValues(values: ValueType): ValueType {
                return Object.keys(values).reduce((acc: ValueType, key: string) => {
                    acc[key] = values[key] === null ? 'Balance?' : values[key];
                    return acc;
                }, {} as ValueType);
            }

            return {
                ...prevLabels,
                ...(elabData[0] !== null && elabData[0] !== undefined ? {plan1: elabData[0]} : {}),
                ...(elabData[1] !== null && elabData[1] !== undefined ? {plan2: elabData[1]} : {}),
                ...(elabDataAcc[0] !== null && elabDataAcc[0] !== undefined ? {accplan1: elabDataAcc[0]} : {}),
                ...(elabDataAcc[1] !== null && elabDataAcc[1] !== undefined ? {accplan2: elabDataAcc[1]} : {}),
                ...(elabDataCon[0] !== null && elabDataCon[0] !== undefined ? {conflict: elabDataCon[0]} : {}),
                ...(elabDataSup[0] !== null && elabDataSup[0] !== undefined ? {dxSupport: elabDataSup[0]} : {}),
                ...(elabDataSup[1] !== null && elabDataSup[1] !== undefined ? {sxSupport: elabDataSup[1]} : {}),
                ...(elabDataGoal[0] !== null && elabDataGoal[0] !== undefined ? {goalplan1: elabDataGoal[0]} : {}),
                ...(elabDataGoal[1] !== null && elabDataGoal[1] !== undefined ? {goalplan2: elabDataGoal[1]} : {}),
                ...(elabDataAgent[0] !== null && elabDataAgent[0] !== undefined ? {agentplan1: elabDataAgent[0]} : {}),
                ...(elabDataAgent[1] !== null && elabDataAgent[1] !== undefined ? {agentplan2: elabDataAgent[1]} : {}),
                ...transformValues(value1 as ValueType),
                ...transformValues(value2 as ValueType),
            };


        })

        setQueryLabels(prevLabels => {

            const elabDataAcc = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                if (item['a'] !== undefined && item['a']['value'] === 'true') {
                    return 'Accomplished'
                } else if (item['a'] !== undefined && item['a']['value'] === 'false') {
                    return 'Unaccomplished'
                } else {
                    return ''
                }
            });
            const elabDataCon = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                if (item['Conflict'] !== undefined && item['Conflict']['value'] === 'inConflictWith') {
                    return 'Conflict'
                } else {
                    return ''
                }
            });
            const elabDataSup = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
                if (item['Conflict'] !== undefined && item['Conflict']['value'] === 'inSupportOf') {
                    return 'Support'
                } else {
                    return ''
                }
            });

            return {
                ...prevLabels,
                ...(elabData[0] !== null && elabData[0] !== undefined ? {plan1: elabData[0]} : {}),
                ...(elabData[1] !== null && elabData[1] !== undefined ? {plan2: elabData[1]} : {}),
                ...(elabDataAcc[0] !== null && elabDataAcc[0] !== undefined ? {accplan1: elabDataAcc[0]} : {}),
                ...(elabDataAcc[1] !== null && elabDataAcc[1] !== undefined ? {accplan2: elabDataAcc[1]} : {}),
                ...(elabDataCon[0] !== null && elabDataCon[0] !== undefined ? {conflict: elabDataCon[0]} : {}),
                ...(elabDataSup[0] !== null && elabDataSup[0] !== undefined ? {dxSupport: elabDataSup[0]} : {}),
                ...(elabDataSup[1] !== null && elabDataSup[1] !== undefined ? {sxSupport: elabDataSup[1]} : {}),
                ...(elabDataGoal[0] !== null && elabDataGoal[0] !== undefined ? {goalplan1: elabDataGoal[0]} : {}),
                ...(elabDataGoal[1] !== null && elabDataGoal[1] !== undefined ? {goalplan2: elabDataGoal[1]} : {}),
                ...(elabDataAgent[0] !== null && elabDataAgent[0] !== undefined ? {agentplan1: elabDataAgent[0]} : {}),
                ...(elabDataAgent[1] !== null && elabDataAgent[1] !== undefined ? {agentplan2: elabDataAgent[1]} : {}),
                ...value1,
                ...value2
            };

        })
    }

    useEffect(() => {
        params.updateData(params.idTableEdit + 1, queryLabels)

        // eslint-disable-next-line
    }, [queryLabels]);

    useEffect(() => {
        const unitParam = params.data[0]['value']
        const editParam = params.edit

        if (unitParam !== '' && editParam === '1') {
            const fetchData = async () => {
                const comment = unitParam + '#' + params.idTableEdit
                try {
                    let query = `
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX : <http://www.purl.org/drammar#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        
                        SELECT (STRAFTER(STR(?p), "#") AS ?Plan) ?a (GROUP_CONCAT(DISTINCT ?Conflict; separator=", ") AS ?Conflict)
                               (STRAFTER(STR(?g), "#") AS ?Goal) (STRAFTER(STR(?ag), "#") AS ?Agent) 
                               (GROUP_CONCAT(DISTINCT REPLACE(STRAFTER(STR(?val), "#"), "_atStake|_inBalance", ""); separator=", ") AS ?Values) 
                               (GROUP_CONCAT(DISTINCT STRAFTER(STR(?state), "#"); separator=", ") AS ?States)
                        WHERE {
                            {
                                SELECT (COUNT(?s) AS ?sCount)
                                WHERE {
                                    ?p rdf:type :DirectlyExecutablePlan .
                                    ?p2 rdf:type :DirectlyExecutablePlan .
                                    ?p ?s ?p2 .
                                    ?p rdfs:comment "${comment}" .
                                    ?p2 rdfs:comment "${comment}" .
                                    FILTER(?s = :inConflictWith)
                                }
                            }
                            ?p rdf:type :DirectlyExecutablePlan .
                            ?p2 rdf:type :DirectlyExecutablePlan .
                            OPTIONAL {
                                ?p :accomplished ?a .
                            }
                            OPTIONAL {
                                ?p ?s ?p2 .
                                BIND(STRAFTER(STR(?s), "#") AS ?Conflict)
                                FILTER(?s IN (:inSupportOf, :inConflictWith))
                            }
                            
                            ?p rdfs:comment "${comment}" .
                            ?p2 rdfs:comment "${comment}" .
                        
                            OPTIONAL {
                                ?g :isAchievedBy ?p .
                            }
                            OPTIONAL {
                                ?ag :intends ?p .
                            }
                            OPTIONAL {
                                ?val :isValueEngagedOf ?ag .
                            }
                            OPTIONAL {
                                ?state :hasData ?val .
                            }
                            FILTER (?sCount = 0 || BOUND(?s))
                        }
                        GROUP BY ?p ?a ?g ?ag

                       `;


                    const response = await axios.get(variables.API_URL_GET, {
                        params: {
                            query,
                        },
                        headers: {
                            'Accept': 'application/sparql-results+json',
                        },
                    });
                    setUnitLabel(response.data['results']['bindings']);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchData().then()
        }
        // eslint-disable-next-line
    }, [params.data[0]['value']]);

    useEffect(() => {
        const groupedData: { [key: string]: string[] } = {};

        params.emoInf.forEach((label: any) => {
            const agent = label['i']['value']
            const emo = label['emo']['value'].split('#')[1].split('_')[0]

            if (!groupedData[agent]) {
                groupedData[agent] = [];
            }

            groupedData[agent].push(emo);
        });

        const emoAgent = Object.keys(groupedData).map(agent => ({
            agent,
            emo: groupedData[agent]
        }));

        setAgentEmotionInf(emoAgent)

        // eslint-disable-next-line
    }, [params.emoInf]);

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
    }, []);

    useEffect(() => {

        const prefixQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.purl.org/drammar#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        `

        if (params.data[0]['value'] !== '' && params.data[0]['save'] === true) {
            const tripleExtra = params.data[0].tripleExtra
            const editParam = params.edit
            const unit = params.data[0].value.replace(/ /g, '_')
            const plan1 = (queryLabels['plan1'] ?? '').replace(/ /g, '_');
            const plan2 = (queryLabels['plan2'] ?? '').replace(/ /g, '_')
            const goal1 = (queryLabels['goalplan1'] ?? '').replace(/ /g, '_')
            const goal2 = (queryLabels['goalplan2'] ?? '').replace(/ /g, '_')
            const agent1 = (queryLabels['agentplan1'] ?? '').replace(/ /g, '_')
            const agent2 = (queryLabels['agentplan2'] ?? '').replace(/ /g, '_')
            const comment = unit + '#' + params['idTableEdit']


            const fetchDataInsert = async (t: string) => {
                try {
                    let query

                    if (t === 'Plan') {
                        conflict = ''
                        accomplished1 = ''
                        accomplished2 = ''
                        let triplePlan = ``
                        if (plan1 !== '') {
                            if (queryLabels['accplan1'] && queryLabels['accplan1'] === 'Accomplished') {
                                accomplished1 = `:${plan1} :accomplished true .`
                            } else if (queryLabels['accplan1']) {
                                accomplished1 = `:${plan1} :accomplished false .`
                            }
                            triplePlan += `
                            :${plan1} rdf:type :DirectlyExecutablePlan.
                            :${plan1} rdfs:comment "${comment}" .
                            :precondition_${plan1} rdf:type :ConsistentStateSet.
                            :precondition_${plan1} rdfs:comment "${comment}" .
                            :precondition_${plan1} :isPlanPreconditionOf :${plan1}.
                            :effect_${plan1} rdf:type :ConsistentStateSet.
                            :effect_${plan1} rdfs:comment "${comment}" .
                            :effect_${plan1} :isPlanEffectOf :${plan1}.
                            :${plan1} :isMotivationFor :Timeline_${unit} .
                            
                            `
                        }
                        if (plan2 !== '') {
                            if (queryLabels['accplan2'] && queryLabels['accplan2'] === 'Accomplished') {
                                accomplished2 = `:${plan2} :accomplished true .`
                            } else if (queryLabels['accplan2']) {
                                accomplished2 = `:${plan2} :accomplished false .`
                            }
                            triplePlan += `
                            :${plan2} rdf:type :DirectlyExecutablePlan.
                            :${plan2} rdfs:comment "${comment}" .
                            :precondition_${plan2} rdf:type :ConsistentStateSet.
                            :precondition_${plan2} rdfs:comment "${comment}" .
                            :precondition_${plan2} :isPlanPreconditionOf :${plan2}.
                            :effect_${plan2} rdf:type :ConsistentStateSet.
                            :effect_${plan2} rdfs:comment "${comment}" .
                            :effect_${plan2} :isPlanEffectOf :${plan2} .
                            :${plan2} :isMotivationFor :Timeline_${unit} .
                            
                            `
                        }
                        if (plan1 !== '' && plan2 !== '') {
                            if (queryLabels['conflict'] && queryLabels['conflict'] !== '') {
                                conflict = `
                                :${plan1} :inConflictWith :${plan2} .
                                :${plan2} :inConflictWith :${plan1} .`
                            } else {
                                if (queryLabels['sxSupport'] && queryLabels['dxSupport'] === '') {
                                    conflict = `:${plan2} :inSupportOf :${plan1} .`
                                } else if (queryLabels['dxSupport'] && queryLabels['sxSupport'] === '') {
                                    conflict = `:${plan1} :inSupportOf :${plan2} .`
                                } else if (queryLabels['sxSupport'] && queryLabels['dxSupport']) {
                                    conflict = `
                                    :${plan1} :inSupportOf :${plan2} .
                                    :${plan2} :inSupportOf :${plan1} .`
                                }
                            }

                            triplePlan += `
                            ${conflict}
                            ${accomplished1}
                            ${accomplished2}
                        `
                        }
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
                        let tripleGoal = ``
                        if (goal1 !== '') {
                            tripleGoal += `
                            :${goal1} rdf:type :Goal.
                            :${goal1} rdfs:comment "${comment}" .
                            :${goal1}_schema rdf:type :GoalSchema.
                            :${goal1}_schema rdfs:comment "${comment}" .
                            :${goal1}_schema :describes :${goal1} .
                            `
                            if (plan1 !== '') {
                                tripleGoal += `
                                :${goal1} :isAchievedBy :${plan1} .
                                
                                `
                            }
                        }
                        if (goal2 !== '') {
                            tripleGoal += `
                            :${goal2} rdf:type :Goal.
                            :${goal2} rdfs:comment "${comment}" .
                            :${goal2}_schema rdf:type :GoalSchema.
                            :${goal2}_schema rdfs:comment "${comment}" .
                            :${goal2}_schema :describes :${goal2} .
                            
                            `
                            if (plan2 !== '') {
                                tripleGoal += `
                                :${goal2} :isAchievedBy :${plan2} .
                                
                                `
                            }
                        }
                        query = `${prefixQuery}
                          INSERT DATA {
                            ${tripleGoal}
                          }
                        `;

                        await axios.post(variables.API_URL_POST, query, {
                            headers: {
                                'Content-Type': 'application/sparql-update'
                            }
                        });
                    } else if (t === 'Agent') {
                        let tripleAgent = ``
                        if (agent1 !== '') {
                            tripleAgent += `
                            :${agent1} rdf:type :Agent.
                            :${agent1} rdfs:comment "${comment}" .
                            `
                            if (plan1 !== '') {
                                tripleAgent += `
                                :${agent1} :intends :${plan1}.
                                
                                `
                            }

                            if (goal1 !== '') {
                                tripleAgent += `
                                :${agent1} :hasGoal :${goal1}.
                                
                                `
                            }
                        }
                        if (agent2 !== '') {
                            tripleAgent += `
                            :${agent2} rdf:type :Agent.
                            :${agent2} rdfs:comment "${comment}" .
                            
                            `
                            if (plan2 !== '') {
                                tripleAgent += `
                                :${agent2} :intends :${plan2}.
                                
                                `
                            }

                            if (goal2 !== '') {
                                tripleAgent += `
                                :${agent2} :hasGoal :${goal2}.
                                
                                `
                            }
                        }

                        query = `${prefixQuery}
                          INSERT DATA {
                            ${tripleAgent}
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

                            tripleEmo += `
                            :${elem}_ES rdf:type :EmotionSchema.
                            :${elem}_ES rdfs:comment "${comment}" .
                            :${elem}_ES :hasEmotionType :${elem}.
                            `

                            if (agent1 !== '') {
                                tripleEmo += `
                                 :${elem}_${agent1} rdf:type :Emotion.
                                 :${elem}_${agent1} rdfs:comment "${comment}" .
                                 :${elem}_${agent1} :isEmotionOf :${agent1}.
                                 :${elem}_ES :describes :${elem}_${agent1}.
                                 
                                 `
                            }

                            if (agent2 !== '') {
                                tripleEmo += `
                                 :${elem}_${agent2} rdf:type :Emotion.
                                 :${elem}_${agent2} rdfs:comment "${comment}" .
                                 :${elem}_${agent2} :isEmotionOf :${agent2}.
                                 :${elem}_ES :describes :${elem}_${agent2}.
                                 
                                 `
                            }
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

                        const generateTriples = (values: any[], agent: any, p: any, acc: string) => {
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
                            
                            `;
                                if (p !== '') {
                                    tripleValue += `
                                    :Precondition_${p}_${elem['value']}_${elem['balPre']} rdf:type :SetMember.
                                    :Precondition_${p}_${elem['value']}_${elem['balPre']} rdfs:comment "${comment}".
                                    :Precondition_${p}_${elem['value']}_${elem['balPre']} :hasData :${elem['value']}_${elem['balPre']}.
                                    :Precondition_${p}_${elem['value']}_${elem['balPre']} :isMemberOf :precondition_${p}.
                                    :Effect_${p}_${elem['value']}_${elem['balEff']} rdf:type :SetMember.
                                    :Effect_${p}_${elem['value']}_${elem['balEff']} rdfs:comment "${comment}".
                                    :Effect_${p}_${elem['value']}_${elem['balEff']} :hasData :${elem['value']}_${elem['balEff']}.
                                    :Effect_${p}_${elem['value']}_${elem['balEff']} :isMemberOf :effect_${p}.
                                    
                                    `
                                }
                                if (queryLabels[acc] === 'Accomplished') {
                                    tripleValue += `
                                    :Effect_${unit}_${elem['value']}_${elem['balEff']} rdf:type :SetMember.
                                    :Effect_${unit}_${elem['value']}_${elem['balEff']} rdfs:comment "${comment}".
                                    :Effect_${unit}_${elem['value']}_${elem['balEff']} :hasData :${elem['value']}_${elem['balEff']}.
                                    :Effect_${unit}_${elem['value']}_${elem['balEff']} :isMemberOf :Effect_${unit}.
                                
                                    `
                                } else {
                                    let effUnitValue
                                    if (elem['balEff'] === 'atStake') {
                                        effUnitValue = 'inBalance'
                                    } else {
                                        effUnitValue = 'atStake'
                                    }
                                    tripleValue += `
                                    :Effect_${unit}_${elem['value']}_${effUnitValue} rdf:type :SetMember.
                                    :Effect_${unit}_${elem['value']}_${effUnitValue} rdfs:comment "${comment}".
                                    :Effect_${unit}_${elem['value']}_${effUnitValue} :hasData :${elem['value']}_${effUnitValue}.
                                    :Effect_${unit}_${elem['value']}_${effUnitValue} :isMemberOf :Effect_${unit}.
                                    `
                                }
                            });
                        }
                        if (agent1 !== '') {
                            generateTriples(value_1, agent1, plan1, 'accplan1');
                        }
                        if (agent2 !== '') {
                            generateTriples(value_2, agent2, plan2, 'accplan2');
                        }

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
                    } else if (t === 'tripleExtra') {

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
                        const triples = tripleExtra.split('\n'); // Divide le triple per riga
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

                    const deleteIndividualQuery = `
                            PREFIX : <http://www.purl.org/drammar#>
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            
                            DELETE {
                              ?individual ?p ?o .
                              ?s ?p2 ?individual .
                            }
                            WHERE {
                              ?individual rdfs:comment "${comment}" .
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
                } catch (err) {
                    console.error(err);
                }
            };

            let accomplished1: any = queryLabels['accplan1'] === 'Accomplished';
            let accomplished2: any = queryLabels['accplan2'] === 'Accomplished';

            let conflict = ''
            if (queryLabels['conflict'] && queryLabels['conflict'] !== '') {
                conflict = queryLabels['conflict']

            } else if (queryLabels['sxSupport'] || queryLabels['dxSupport']) {
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

            if (Object.values(triplesQuery).length === 0 && editParam === 0) {

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
                        Value2: value_2,
                        tripleExtra: tripleExtra
                    }
                )

                const fetchData = async () => {
                    try {
                        await fetchDataInsert('Plan');
                        await fetchDataInsert('Goal');
                        await fetchDataInsert('Agent');
                        await fetchDataInsert('Emotion');
                        await fetchDataInsert('Value');
                        await fetchDataInsert('tripleExtra').then()
                        params.updateData(0);
                    } catch (error) {
                        console.error('Errore durante l\'aggiornamento dei dati:', error);
                    }
                };

                fetchData().then();

            } else {
                const fetchData = async () => {
                    try {
                        await fetchDataDelete();
                        await fetchDataInsert('Plan');
                        await fetchDataInsert('Goal');
                        await fetchDataInsert('Agent');
                        await fetchDataInsert('Emotion');
                        await fetchDataInsert('Value');
                        await fetchDataInsert('tripleExtra')
                        params.updateData(0);
                    } catch (error) {
                        console.error('Errore durante l\'aggiornamento dei dati:', error);
                    }
                };

                fetchData().then();
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
                        Value2: value_2,
                        tripleExtra: tripleExtra
                    }
                )

            }

        } else {
            if (params.data[0]['save'] === true) {
                params.updateData(0)
            }
        }
        // eslint-disable-next-line
    }, [params.data[0]['save']]);

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

    const rowContent = (rowIndex: number, _ :any) => {
        function ButtonsValue(index: number, column: ColumnData, flag: boolean) {
            if (!flag) {
                return (
                    <Box
                        key={'Value ' + index + ' ' + column.dataKey}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        position="relative"
                        marginTop={2}
                        height={'56px'}
                    >
                        <Stack direction="row" spacing={2} alignItems={"center"}>
                            <Button style={{textTransform: 'none'}} variant="contained" disabled>
                                Balance?
                            </Button>
                            <Button style={{textTransform: 'none'}} variant="contained" disabled>
                                Value?
                            </Button>
                            <Button style={{textTransform: 'none'}} variant="contained" disabled>
                                Balance?
                            </Button>
                        </Stack>
                        <Tooltip title={<span style={{fontSize: '1.2em'}}>Add New Value</span>}
                                 placement="top"
                                 arrow>
                            <span>
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
                            </span>
                        </Tooltip>
                    </Box>
                );
            } else {
                return (
                    <Box key={'Value ' + index + ' ' + column.dataKey} position="relative"
                         display="flex"
                         justifyContent="center"
                         alignItems="center">
                        <Stack direction="row" spacing={2} display="flex"  justifyContent="center"
                               alignItems="center"
                               position="relative">
                            <Tooltip title={<span style={{fontSize: '1.2em'}}>State of Value before the Plan</span>}
                                     placement="top" arrow>
                                <span>
                                    <Button style={{
                                        textTransform: 'none',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                            variant="outlined"
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
                                                borderColor: labels['balPre' + index + '_' + column.dataKey] === 'inBalance' ? 'green' : labels['balPre' + index + '_' + column.dataKey] === 'atStake' ? 'red' : 'theme.palette.primary.main',
                                                color: labels['balPre' + index + '_' + column.dataKey] === 'inBalance' ? 'green' : labels['balPre' + index + '_' + column.dataKey] === 'atStake' ? 'red' : 'theme.palette.primary.main',
                                                fontWeight: labels['balPre' + index + '_' + column.dataKey] === 'inBalance' ? 'bold' : labels['balPre' + index + '_' + column.dataKey] === 'atStake' ? 'bold' : 'normal',
                                            }}>
                                        {labels['balPre' + index + '_' + column.dataKey] === undefined ? 'Balance?' : labels['balPre' + index + '_' + column.dataKey]}
                                    </Button>
                                </span>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorEls['balPre' + index + '_' + column.dataKey]}
                                open={Boolean(anchorEls['balPre' + index + '_' + column.dataKey])}
                                onClose={() => handleClose('balPre' + index + '_' + column.dataKey)}
                            >
                                <MenuItem>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleConfirm('balPre' + index + '_' + column.dataKey, 'inBalance')}
                                        style={{backgroundColor: 'green', color: 'white', textTransform: 'none'}}
                                    >
                                        inBalance
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button variant="contained"
                                            onClick={() => handleConfirm('balPre' + index + '_' + column.dataKey, 'atStake')}
                                            style={{backgroundColor: 'red', color: 'white', textTransform: 'none'}}
                                    >
                                        atStake
                                    </Button>
                                </MenuItem>
                            </Menu>
                            <Tooltip title={<span style={{fontSize: '1.2em'}}>Value Title</span>} placement="top" arrow>
                                <span>
                                    <Button style={{
                                        textTransform: 'none',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                            variant="outlined"
                                            onDoubleClick={(e) => {
                                                if (inputs['value' + index + '_' + column.dataKey] !== undefined || queryLabels['value' + index + '_' + column.dataKey] !== '') {
                                                    handleClick(e, 'value' + index + '_' + column.dataKey);
                                                }
                                            }}
                                            onClick={(e) => {
                                                if (inputs['value' + index + '_' + column.dataKey] === undefined && queryLabels['value' + index + '_' + column.dataKey] === '') {
                                                    handleClick(e, 'value' + index + '_' + column.dataKey)
                                                }
                                            }}
                                            sx={{
                                                fontWeight: labels['value' + index + '_' + column.dataKey] !== 'Value?' && labels['value' + index + '_' + column.dataKey] !== undefined ? 'bold' : 'normal',
                                            }}
                                    >
                                        {labels['value' + index + '_' + column.dataKey] === undefined ? 'Value?' : labels['value' + index + '_' + column.dataKey].replace(/_/g, ' ')}
                                    </Button>
                                </span>
                            </Tooltip>
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
                            <Tooltip title={<span style={{fontSize: '1.2em'}}>State of Value after the Plan</span>}
                                     placement="top" arrow>
                                <span>
                                    <Button style={{
                                        textTransform: 'none',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                            variant="outlined"
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
                                                borderColor: labels['balEff' + index + '_' + column.dataKey] === 'inBalance' ? 'green' : labels['balEff' + index + '_' + column.dataKey] === 'atStake' ? 'red' : 'theme.palette.primary.main',
                                                color: labels['balEff' + index + '_' + column.dataKey] === 'inBalance' ? 'green' : labels['balEff' + index + '_' + column.dataKey] === 'atStake' ? 'red' : 'theme.palette.primary.main',
                                                fontWeight: labels['balEff' + index + '_' + column.dataKey] === 'inBalance' ? 'bold' : labels['balEff' + index + '_' + column.dataKey] === 'atStake' ? 'bold' : 'normal',
                                            }}>
                                        {labels['balEff' + index + '_' + column.dataKey] === undefined ? 'Balance?' : labels['balEff' + index + '_' + column.dataKey]}
                                    </Button>
                                </span>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorEls['balEff' + index + '_' + column.dataKey]}
                                open={Boolean(anchorEls['balEff' + index + '_' + column.dataKey])}
                                onClose={() => handleClose('balEff' + index + '_' + column.dataKey)}
                            >
                                <MenuItem>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleConfirm('balEff' + index + '_' + column.dataKey, 'inBalance')}
                                        style={{backgroundColor: 'green', color: 'white', textTransform: 'none'}}
                                    >
                                        inBalance
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button variant="contained"
                                            onClick={() => handleConfirm('balEff' + index + '_' + column.dataKey, 'atStake')}
                                            style={{backgroundColor: 'red', color: 'white', textTransform: 'none'}}
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
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" style={{marginRight: 8}}>
                                        Agent
                                    </Typography>
                                    <Tooltip title={<span style={{fontSize: '1.2em'}}>Agent Title</span>}
                                             placement="top" arrow>
                                        <span>
                                            <Button
                                                style={{textTransform: 'none'}}
                                                variant="outlined"
                                                onDoubleClick={(e) => {
                                                    if (inputs['agent' + keyLabel] !== undefined || queryLabels['agent' + keyLabel] !== '') {
                                                        handleClick(e, 'agent' + keyLabel);
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    if (inputs['agent' + keyLabel] === undefined && queryLabels['agent' + keyLabel] === '') {
                                                        handleClick(e, 'agent' + keyLabel)
                                                    }
                                                }}
                                                sx={{
                                                    m: 1,
                                                    fontWeight: queryLabels['agent' + keyLabel] !== '' ? 'bold' : 'normal',
                                                    width: '150px',
                                                    height: 'auto'
                                                }}
                                            >
                                                {labels['agent' + keyLabel].replace(/_/g, ' ')}
                                            </Button>
                                        </span>
                                    </Tooltip>
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
                                        <Button variant="contained" onClick={() => handleConfirm('agent' + keyLabel)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" style={{marginRight: 8}}>
                                        Goal
                                    </Typography>
                                    <Tooltip title={<span style={{fontSize: '1.2em'}}>Goal Title</span>} placement="top"
                                             arrow>
                                        <span>
                                            <Button
                                                style={{textTransform: 'none'}}
                                                variant="outlined"
                                                onDoubleClick={(e) => {
                                                    if (inputs['goal' + keyLabel] !== undefined || queryLabels['goal' + keyLabel] !== '') {
                                                        handleClick(e, 'goal' + keyLabel);
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    if (inputs['goal' + keyLabel] === undefined && queryLabels['goal' + keyLabel] === '') {
                                                        handleClick(e, 'goal' + keyLabel)
                                                    }
                                                }}
                                                sx={{
                                                    m: 1,
                                                    fontWeight: queryLabels['goal' + keyLabel] !== '' ? 'bold' : 'normal',
                                                    width: '150px',
                                                    height: 'auto'
                                                }}
                                            >
                                                {labels['goal' + keyLabel].replace(/_/g, ' ')}
                                            </Button>
                                        </span>
                                    </Tooltip>
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
                                        <Button variant="contained" onClick={() => handleConfirm('goal' + keyLabel)}>
                                            Confirm
                                        </Button>
                                    </MenuItem>
                                </Menu>
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" style={{marginRight: 8}}>
                                        Plan
                                    </Typography>
                                    <Tooltip title={<span style={{fontSize: '1.2em'}}>Plan Title</span>} placement="top"
                                             arrow>
                                        <span>
                                            <Button
                                                style={{textTransform: 'none'}}
                                                variant="outlined"
                                                onDoubleClick={(e) => {
                                                    if (inputs[keyLabel] !== undefined || queryLabels[keyLabel] !== '') {
                                                        handleClick(e, keyLabel);
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    if (inputs[keyLabel] === undefined && queryLabels[keyLabel] === '') {
                                                        handleClick(e, keyLabel);
                                                    }
                                                }}
                                                sx={{
                                                    m: 1,
                                                    fontWeight: queryLabels[keyLabel] !== '' ? 'bold' : 'normal',
                                                    width: '150px',
                                                    height: 'auto'
                                                }}
                                            >
                                                {labels[keyLabel].replace(/_/g, ' ')}
                                            </Button>
                                        </span>
                                    </Tooltip>
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
                                <Tooltip title={<span style={{fontSize: '1.2em'}}>Plan Completion</span>}
                                         placement="top" arrow>
                                    <span>
                                        <Button
                                            style={{textTransform: 'none'}}
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
                                                borderColor: labels['acc' + keyLabel] === 'Accomplished' ? 'green' : labels['acc' + keyLabel] === 'Unaccomplished' ? 'red' : 'theme.palette.primary.main',
                                                color: labels['acc' + keyLabel] === 'Accomplished' ? 'green' : labels['acc' + keyLabel] === 'Unaccomplished' ? 'red' : 'theme.palette.primary.main',
                                                fontWeight: labels['acc' + keyLabel] === 'Accomplished' ? 'bold' : labels['acc' + keyLabel] === 'Unaccomplished' ? 'bold' : 'normal',
                                            }}
                                            disabled={queryLabels[keyLabel] === '' && inputs[keyLabel] === undefined}
                                        >
                                            {labels['acc' + keyLabel]}
                                        </Button>
                                    </span>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEls['acc' + keyLabel]}
                                    open={Boolean(anchorEls['acc' + keyLabel])}
                                    onClose={() => handleClose('acc' + keyLabel)}
                                >
                                    <MenuItem>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleConfirm('acc' + keyLabel, 'Accomplished')}
                                            style={{backgroundColor: 'green', color: 'white', textTransform: 'none'}}
                                        >
                                            Accomplished
                                        </Button>
                                    </MenuItem>
                                    <MenuItem>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleConfirm('acc' + keyLabel, 'Unaccomplished')}
                                            style={{backgroundColor: 'red', color: 'white', textTransform: 'none'}}
                                        >
                                            Unaccomplished
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
                                                 style={{height: '72px'}}>
                                            </div>
                                        )
                                    } else if (el === 2 && posForTemplate[0] === column.dataKey) {
                                        return (
                                            <div key={'Value ' + index + ' ' + column.dataKey}
                                                 style={{height: '72px'}}>
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
                        cellContent = (<div>
                            {groups.map((el, index) => {
                                    if (el === 1 || el === 2) {
                                        return <Box key={'Value ' + index + ' ' + column.dataKey} position="relative"
                                                    display="inline-block">
                                            <Stack direction="row" spacing={2} alignItems={"center"}>
                                                <Tooltip title={<span style={{fontSize: '1.2em'}}>State of Value before the Unit</span>}
                                                         placement="top"
                                                         arrow>
                                                        <Button style={{
                                                            textTransform: 'none',
                                                            height: '56px',
                                                            width: '33px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginTop: '1.1em'
                                                        }}
                                                                variant="outlined"
                                                                onDoubleClick={(e) => {
                                                                    if (labels['balPreUnit' + index + '_' + column.dataKey] !== undefined) {
                                                                        handleClick(e, 'balPreUnit' + index + '_' + column.dataKey);
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    if (labels['balPreUnit' + index + '_' + column.dataKey] === undefined || labels['balPreUnit' + index + '_' + column.dataKey] === 'Balance?') {
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
                                                                            ? 'red' : 'theme.palette.primary.main',
                                                                    fontWeight: labels['balPreUnit' + index + '_' + column.dataKey] === 'inBalance'
                                                                        ? 'bold'
                                                                        : labels['balPreUnit' + index + '_' + column.dataKey] === 'atStake'
                                                                            ? 'bold' : 'normal',
                                                                }}>
                                                            {labels['balPreUnit' + index + '_' + column.dataKey] === undefined ? 'Balance?' : labels['balPreUnit' + index + '_' + column.dataKey]}
                                                        </Button>

                                                </Tooltip>
                                                <Menu
                                                    anchorEl={anchorEls['balPreUnit' + index + '_' + column.dataKey]}
                                                    open={Boolean(anchorEls['balPreUnit' + index + '_' + column.dataKey])}
                                                    onClose={() => handleClose('balPreUnit' + index + '_' + column.dataKey)}
                                                >
                                                    <MenuItem>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleConfirm('balPreUnit' + index + '_' + column.dataKey, 'inBalance')}
                                                            style={{
                                                                backgroundColor: 'green',
                                                                color: 'white',
                                                                textTransform: 'none'
                                                            }}
                                                        >
                                                            inBalance
                                                        </Button>

                                                    </MenuItem>
                                                    <MenuItem>
                                                        <Button variant="contained"
                                                                onClick={() => handleConfirm('balPreUnit' + index + '_' + column.dataKey, 'atStake')}
                                                                style={{
                                                                    backgroundColor: 'red',
                                                                    color: 'white',
                                                                    textTransform: 'none'
                                                                }}
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
                                                 style={{height: '86px'}}>
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
                                <Tooltip title={<span style={{fontSize: '1.2em'}}>Plan 2 in Support Of Plan 1</span>}
                                         placement="top"
                                         arrow>
                                    <span>
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
                                            disabled={(inputs['plan1'] === undefined || inputs['plan2'] === undefined) && (queryLabels['plan1'] === '' || queryLabels['plan2'] === '')}
                                        >
                                            <ArrowBackIosNewIcon/>
                                            <Typography variant="button" display="block"
                                                        sx={{fontWeight: labels['sxSupport'] !== 'Support?' ? 'bold' : 'normal'}}>{labels['sxSupport']}</Typography>
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<span style={{fontSize: '1.2em'}}>Plan 1 in Conflict with Plan 2</span>}
                                         placement="top"
                                         arrow>
                                    <span>
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
                                            disabled={(inputs['plan1'] === undefined || inputs['plan2'] === undefined) && (queryLabels['plan1'] === '' || queryLabels['plan2'] === '')}
                                        >
                                            <ArrowBackIosNewIcon/>
                                            <Typography variant="button" display="block"
                                                        sx={{fontWeight: labels['conflict'] !== 'Conflict?' ? 'bold' : 'normal'}}>{labels['conflict']}</Typography>
                                            <ArrowForwardIosIcon/>
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<span style={{fontSize: '1.2em'}}>Plan 1 in Support of Plan 2</span>}
                                         placement="top"
                                         arrow>
                                    <span>
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
                                            disabled={(inputs['plan1'] === undefined || inputs['plan2'] === undefined) && (queryLabels['plan1'] === '' || queryLabels['plan2'] === '')}
                                        >
                                            <Typography variant="button" display="block"
                                                        sx={{fontWeight: labels['dxSupport'] !== 'Support?' ? 'bold' : 'normal'}}>{labels['dxSupport']}</Typography>
                                            <ArrowForwardIosIcon/>
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        );
                    } else if (2 === rowIndex && (posForTemplate[0] === column.dataKey || posForTemplate[1] === column.dataKey)) {
                        let keyLabel: string

                        if (column.dataKey === 'unit_b') {
                            keyLabel = 'plan1'
                        } else if (column.dataKey === 'unit_n') {
                            keyLabel = 'plan2'
                        } else {
                            keyLabel = column.dataKey
                        }

                        const filteredAgent = agentEmotionInf.find((item: {
                            agent: any;
                        }) => item.agent === labels['agent' + keyLabel]);

                        cellContent = (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                                padding={2}
                            >
                                {filteredAgent?.emo.map((emotion: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                                    <Button
                                        key={index}
                                        variant="contained"
                                        color="warning"
                                        style={{margin: '4px'}}
                                    >
                                        {emotion}
                                    </Button>
                                ))}
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
                        </TableCell>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <>
            {initialRows.map((row, index) => (
                <TableRow key={index}>
                    {rowContent(index, row)}
                </TableRow>
            ))}
        </>
    );
}

export default TableEdit;