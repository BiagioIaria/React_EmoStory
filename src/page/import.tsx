import {Box, Button, Typography, Stack, CircularProgress} from '@mui/material';
import React, {useEffect, useState} from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from "axios";
import {variables} from "../endPoint";

function Import() {
    const [kb, setKb] = useState<any>({});
    const [fileName, setFileName] = useState<string | null>(null);
    const [emotion, setEmotion] = useState([]);
    const [loading, setLoading] = useState(false);

    function setEmotionQuery(data: any) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Emotion']['value'];
        });
        setEmotion(elabData);
    }

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
            if (Object.keys(kb).length !== 0) {

                const prefixQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX : <http://www.purl.org/drammar#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>`

                const unit = kb['Unit'][0].replace(/ /g, '_')

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

                const fetchDataInsert = async (t: string) => {
                        function comments(commentIndex: any, plan: any, elem: any) {
                            let comment = ''
                            for (let j = 0; j < commentIndex[plan].length; j++) {
                                comment += `:${elem} rdfs:comment "${commentIndex[plan][j]}" .
                        
                                    `
                            }
                            return comment;
                        }

                        try {
                            let commentIndex: any = {}
                            let comment
                            let index = 0
                            if (Object.keys(kb).includes('inConflictWith')) {

                                for (let i = 0; i < kb['inConflictWith'].length; i++) {
                                    comment = `${unit}_${index}`
                                    index += 1

                                    const plan1 = kb['inConflictWith'][i]['p1']
                                    const plan2 = kb['inConflictWith'][i]['p2']

                                    if (Object.keys(commentIndex).includes(plan1)) {
                                        commentIndex[plan1].push(comment)
                                    } else {
                                        commentIndex[plan1] = [comment]
                                    }
                                    if (Object.keys(commentIndex).includes(plan2)) {
                                        commentIndex[plan2].push(comment)
                                    } else {
                                        commentIndex[plan2] = [comment]
                                    }
                                }

                            } else if (Object.keys(kb).includes('inSupportOf')) {

                                for (let i = 0; i < kb['inSupportOf'].length; i++) {
                                    comment = `${unit}_${index}`
                                    index += 1

                                    const plan1 = kb['inSupportOf'][i]['p1']
                                    const plan2 = kb['inSupportOf'][i]['p2']

                                    if (Object.keys(commentIndex).includes(plan1)) {
                                        commentIndex[plan1].push(comment)
                                    } else {
                                        commentIndex[plan1] = [comment]
                                    }
                                    if (Object.keys(commentIndex).includes(plan2)) {
                                        commentIndex[plan2].push(comment)
                                    } else {
                                        commentIndex[plan2] = [comment]
                                    }
                                }

                            }
                            if (t === 'Unit') {
                                let tripleUnit = `
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
                        
                        `;
                                if (Object.keys(kb).includes('precedes')) {
                                    for (let i = 0; i < kb['precedes'].length; i++) {
                                        tripleUnit += `
                                        :Timeline_${kb['precedes'][i]['p1']} :precedes :Timeline_${kb['precedes'][i]['p2']}
                                        
                                        `
                                    }
                                }

                                if (Object.keys(kb).includes('follows')) {
                                    for (let i = 0; i < kb['follows'].length; i++) {
                                        tripleUnit += `
                                        :Timeline_${kb['follows'][i]['p1']} :follows :Timeline_${kb['follows'][i]['p2']}
                                        
                                        `
                                    }
                                }

                                const BATCH_SIZE = 4;
                                const triples = tripleUnit.split('\n'); // Divide le triple per riga
                                for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                                    const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                                    await sendBatchQuery(batch);
                                }

                            } else if (t === 'Plan') {

                                let triplePlan = ``
                                let plan1
                                let plan2
                                let conflict
                                let accomplished1 = ''
                                let accomplished2 = ''

                                if (Object.keys(kb).includes('inConflictWith')) {

                                    for (let i = 0; i < kb['inConflictWith'].length; i++) {

                                        plan1 = kb['inConflictWith'][i]['p1']
                                        plan2 = kb['inConflictWith'][i]['p2']

                                        conflict = `:${plan1} :inConflictWith :${plan2}
                                            :${plan2} :inConflictWith :${plan1}`

                                        if (Object.keys(kb).includes('accomplished') || Object.keys(kb).includes('unaccomplished')) {
                                            if (kb['accomplished'].includes(plan1)) {
                                                accomplished1 = `:${plan1} :accomplished true .`
                                            } else if (kb['unaccomplished'].includes(plan1)) {
                                                accomplished1 = `:${plan1} :accomplished false .`
                                            }

                                            if (kb['accomplished'].includes(plan2)) {
                                                accomplished2 = `:${plan2} :accomplished true .`
                                            } else if (kb['unaccomplished'].includes(plan2)) {
                                                accomplished2 = `:${plan2} :accomplished false .`
                                            }
                                        }
                                        triplePlan += `
                                :${plan1} rdf:type :DirectlyExecutablePlan.
                                ${comments(commentIndex, plan1, plan1)}
                                :${plan2} rdf:type :DirectlyExecutablePlan.
                                ${comments(commentIndex, plan2, plan2)}
                                :precondition_${plan1} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan1, `precondition_${plan1}`)}
                                :precondition_${plan1} :isPlanPreconditionOf :${plan1}.
                                :effect_${plan1} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan1, `effect_${plan1}`)}
                                :effect_${plan1} :isPlanEffectOf :${plan1}.
                                :precondition_${plan2} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan2, `precondition_${plan2}`)}
                                :precondition_${plan2} :isPlanPreconditionOf :${plan2}.
                                :effect_${plan2} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan2, `effect_${plan2}`)}
                                :effect_${plan2} :isPlanEffectOf :${plan2} .
                                :${plan1} :isMotivationFor :Timeline_${unit} .
                                :${plan2} :isMotivationFor :Timeline_${unit} .
                                ${conflict}
                                ${accomplished1}
                                ${accomplished2}
                                
                                `
                                    }
                                } else if (Object.keys(kb).includes('inSupportOf')) {

                                    for (let i = 0; i < kb['inSupportOf'].length; i++) {

                                        plan1 = kb['inSupportOf'][i]['p1']
                                        plan2 = kb['inSupportOf'][i]['p2']

                                        conflict = `:${plan1} :inSupportOf :${plan2}`
                                        if (Object.keys(kb).includes('accomplished') || Object.keys(kb).includes('unaccomplished')) {
                                            if (kb['accomplished'].includes(plan1)) {
                                                accomplished1 = `:${plan1} :accomplished true .`
                                            } else if (kb['unaccomplished'].includes(plan1)) {
                                                accomplished1 = `:${plan1} :accomplished false .`
                                            }

                                            if (kb['accomplished'].includes(plan2)) {
                                                accomplished2 = `:${plan2} :accomplished true .`
                                            } else if (kb['unaccomplished'].includes(plan2)) {
                                                accomplished2 = `:${plan2} :accomplished false .`
                                            }
                                        }

                                        triplePlan += `
                                :${plan1} rdf:type :DirectlyExecutablePlan.
                                ${comments(commentIndex, plan1, plan1)}
                                :${plan2} rdf:type :DirectlyExecutablePlan.
                                ${comments(commentIndex, plan2, plan2)}
                                :precondition_${plan1} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan1, `precondition_${plan1}`)}
                                :precondition_${plan1} :isPlanPreconditionOf :${plan1}.
                                :effect_${plan1} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan1, `effect_${plan1}`)}
                                :effect_${plan1} :isPlanEffectOf :${plan1}.
                                :precondition_${plan2} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan2, `precondition_${plan2}`)}
                                :precondition_${plan2} :isPlanPreconditionOf :${plan2}.
                                :effect_${plan2} rdf:type :ConsistentStateSet.
                                ${comments(commentIndex, plan2, `effect_${plan2}`)}
                                :effect_${plan2} :isPlanEffectOf :${plan2} .
                                :${plan1} :isMotivationFor :Timeline_${unit} .
                                :${plan2} :isMotivationFor :Timeline_${unit} .
                                ${conflict}
                                ${accomplished1}
                                ${accomplished2}
                                
                                `
                                    }
                                }

                                const BATCH_SIZE = 4;
                                const triples = triplePlan.split('\n'); // Divide le triple per riga
                                for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                                    const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                                    await sendBatchQuery(batch);
                                }

                            } else if (t === 'Goal') {

                                let tripleGoal = ``
                                let goal
                                let plan

                                if (Object.keys(kb).includes('achieves')) {

                                    for (let i = 0; i < kb['achieves'].length; i++) {
                                        plan = kb['achieves'][i]['p']
                                        goal = kb['achieves'][i]['g']
                                        for (let j = 0; j < commentIndex[plan].length; j++) {
                                            comment += `:${plan} rdfs:comment "${commentIndex[plan][j]}" .
                                    `
                                        }

                                        tripleGoal += `
                                :${goal} rdf:type :Goal.
                                ${comments(commentIndex, plan, goal)}
                                :${goal}_schema rdf:type :GoalSchema.
                                ${comments(commentIndex, plan, `${goal}_schema`)}
                                :${goal}_schema :describes :${goal} .                           
                                :${goal} :isAchievedBy :${plan} .
                                
                                `
                                    }
                                }


                                const BATCH_SIZE = 4;
                                const triples = tripleGoal.split('\n'); // Divide le triple per riga
                                for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                                    const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                                    await sendBatchQuery(batch);
                                }

                            } else if (t === 'Agent') {

                                let tripleAgent = ``
                                let goal
                                let plan
                                let agent

                                if (Object.keys(kb).includes('intends')) {

                                    for (let i = 0; i < kb['intends'].length; i++) {
                                        agent = kb['intends'][i]['a']
                                        plan = kb['intends'][i]['p']
                                        goal = ''
                                        for (let j = 0; j < kb['achieves'].length; j++) {
                                            if (kb['achieves'][j]['p'] === plan) {
                                                goal = kb['achieves'][j]['g']
                                                break
                                            }
                                        }

                                        tripleAgent += `
                                :${agent} rdf:type :Agent.
                                ${comments(commentIndex, plan, agent)}
                                :${agent} :hasGoal :${goal}.                                
                                :${agent} :intends :${plan}.                                
                                
                                `
                                    }
                                }

                                if (Object.keys(kb).includes('Pleasant')) {
                                    for (let i = 0; i < kb['Pleasant'].length; i++) {
                                        if (kb['Agent'].includes(kb['Pleasant'][i])) {
                                            tripleAgent += `
                                            :${kb['Pleasant'][i]} :pleasant true.                             
                                            
                                            `
                                        } else {
                                            tripleAgent += `
                                            :${kb['Pleasant'][i]} rdf:type :Object.
                                            ${comments(commentIndex, plan, kb['Pleasant'][i])}
                                            :${kb['Pleasant'][i]} :pleasant true.                             
                                            
                                            `
                                        }
                                    }
                                }
                                if (Object.keys(kb).includes('Unpleasant')) {
                                    for (let i = 0; i < kb['Unpleasant'].length; i++) {
                                        if (kb['Agent'].includes(kb['Unpleasant'][i])) {
                                            tripleAgent += `
                                            :${kb['Unpleasant'][i]} :pleasant false.                             
                                            
                                            `
                                        } else {
                                            tripleAgent += `
                                            :${kb['Unpleasant'][i]} rdf:type :Object.
                                            ${comments(commentIndex, plan, kb['Unpleasant'][i])}
                                            :${kb['Unpleasant'][i]} :pleasant false.                             
                                            
                                            `
                                        }
                                    }
                                }

                                if (Object.keys(kb).includes('Like')) {
                                    for (let i = 0; i < kb['Like'].length; i++) {
                                        agent = kb['Like'][i]['a']
                                        const ao = kb['Like'][i]['ao']
                                        if (kb['Agent'].includes(ao)) {
                                            tripleAgent += `
                                            :${agent} :likes :${ao}.                             
                                            
                                            `
                                        } else {
                                            tripleAgent += `
                                            :${ao} rdf:type :Object.
                                            ${comments(commentIndex, plan, ao)}
                                            :${agent} :likes :${ao}.                       
                                            
                                            `
                                        }
                                    }
                                }
                                if (Object.keys(kb).includes('Dislike')) {
                                    for (let i = 0; i < kb['Dislike'].length; i++) {
                                        agent = kb['Dislike'][i]['a']
                                        const ao = kb['Dislike'][i]['ao']
                                        if (kb['Agent'].includes(ao)) {
                                            tripleAgent += `
                                            :${agent} :dislikes :${ao}.                             
                                            
                                            `
                                        } else {
                                            tripleAgent += `
                                            :${ao} rdf:type :Object.
                                            ${comments(commentIndex, plan, ao)}
                                            :${agent} :dislikes :${ao}.                       
                                            
                                            `
                                        }
                                    }
                                }

                                const BATCH_SIZE = 4;
                                const triples = tripleAgent.split('\n'); // Divide le triple per riga
                                for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                                    const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                                    await sendBatchQuery(batch);
                                }

                            } else if (t === 'Emotion') {

                                let tripleEmo = ``;

                                if (Object.keys(kb).includes('Agent')) {
                                    for (let agentIndex = 0; agentIndex < kb['Agent'].length; agentIndex++) {
                                        let agent = kb['Agent'][agentIndex];
                                        let plan = '';

                                        for (let intendIndex = 0; intendIndex < kb['intends'].length; intendIndex++) {
                                            if (kb['intends'][intendIndex]['a'] === agent) {
                                                plan = kb['intends'][intendIndex]['p'];
                                                break;
                                            }
                                        }

                                        let tempTriple = '';

                                        emotion.forEach((elem) => {
                                            tempTriple += `
                                    :${elem}_${agent} rdf:type :Emotion.
                                    ${comments(commentIndex, plan, `${elem}_${agent}`)}
                                    :${elem}_${agent} :isEmotionOf :${agent}.
                                    :${elem}_ES rdf:type :EmotionSchema.
                                    ${comments(commentIndex, plan, `${elem}_ES`)}
                                    :${elem}_ES :hasEmotionType :${elem}.
                                    :${elem}_ES :describes :${elem}_${agent}.
                                    `;
                                        });

                                        tripleEmo += tempTriple;
                                    }
                                }

                                const BATCH_SIZE = 4;
                                const triples = tripleEmo.split('\n'); // Divide le triple per riga
                                for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                                    const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                                    await sendBatchQuery(batch);
                                }


                            } else if (t === 'Value') {
                                let tripleValue = ``;
                                let agent
                                let plans: any = []

                                if (Object.keys(kb).includes('Value')) {
                                    for (let valueIndex = 0; valueIndex < kb['Value'].length; valueIndex++) {
                                        const planComment = (elem: string, p: any) => {
                                            let c = ''
                                            for (let planIndex = 0; planIndex < p.length; planIndex++) {
                                                c += comments(commentIndex, p[planIndex], elem)
                                            }
                                            return c
                                        }

                                        let value = kb['Value'][valueIndex];

                                        for (let hasValueIndex = 0; hasValueIndex < kb['hasValue'].length; hasValueIndex++) {
                                            if (kb['hasValue'][hasValueIndex]['v'] === value) {
                                                agent = kb['hasValue'][hasValueIndex]['a'];
                                                break;
                                            }
                                        }

                                        let stake = []
                                        for (let stakeInSetIndex = 0; stakeInSetIndex < kb['atStakeInSet'].length; stakeInSetIndex++) {
                                            if (kb['atStakeInSet'][stakeInSetIndex]['v'] === value) {
                                                stake.push(kb['atStakeInSet'][stakeInSetIndex]['s'])
                                            }
                                        }

                                        let balance = []
                                        for (let balanceInSetIndex = 0; balanceInSetIndex < kb['inBalanceInSet'].length; balanceInSetIndex++) {
                                            if (kb['inBalanceInSet'][balanceInSetIndex]['v'] === value) {
                                                balance.push(kb['inBalanceInSet'][balanceInSetIndex]['s'])
                                            }
                                        }

                                        for (let stakeIndex = 0; stakeIndex < stake.length; stakeIndex++) {
                                            for (let k = 0; k < kb['hasPrecondition'].length; k++) {
                                                if (kb['hasPrecondition'][k]['s'] === stake[stakeIndex]) {
                                                    if (kb['hasPrecondition'][k]['pu'] !== unit) {
                                                        plans.push(kb['hasPrecondition'][k]['pu'])
                                                    } else {
                                                        tripleValue += `
                                                        :Precondition_${unit}_${value}_atStake rdf:type :SetMember.
                                                        ${planComment(`Precondition_${unit}_${value}_atStake`, plans)}
                                                        :Precondition_${unit}_${value}_atStake :hasData :${value}_atStake.
                                                        :Precondition_${unit}_${value}_atStake :isMemberOf :Precondition_${unit}.
                                                        
                                                        `
                                                    }
                                                }
                                            }
                                            for (let k = 0; k < kb['hasEffect'].length; k++) {
                                                if (kb['hasEffect'][k]['s'] === stake[stakeIndex]) {
                                                    if (kb['hasEffect'][k]['pu'] !== unit) {
                                                        plans.push(kb['hasEffect'][k]['pu'])
                                                    } else {
                                                        tripleValue += `
                                                        :Effect_${unit}_${value}_atStake rdf:type :SetMember.
                                                        ${planComment(`Effect_${unit}_${value}_atStake`, plans)}
                                                        :Effect_${unit}_${value}_atStake :hasData :${value}_atStake.
                                                        :Effect_${unit}_${value}_atStake :isMemberOf :Effect_${unit}.
                                                        
                                                        `
                                                    }
                                                }
                                            }
                                        }

                                        for (let balanceIndex = 0; balanceIndex < balance.length; balanceIndex++) {
                                            for (let k = 0; k < kb['hasPrecondition'].length; k++) {
                                                if (kb['hasPrecondition'][k]['s'] === balance[balanceIndex]) {
                                                    if (kb['hasPrecondition'][k]['pu'] !== unit) {
                                                        plans.push(kb['hasPrecondition'][k]['pu'])
                                                    } else {
                                                        tripleValue += `
                                                        :Precondition_${unit}_${value}_inBalance rdf:type :SetMember.
                                                        ${planComment(`Precondition_${unit}_${value}_inBalance`, plans)}
                                                        :Precondition_${unit}_${value}_inBalance :hasData :${value}_inBalance.
                                                        :Precondition_${unit}_${value}_inBalance :isMemberOf :Precondition_${unit}.
                                                        
                                                        `
                                                    }
                                                }
                                            }
                                            for (let k = 0; k < kb['hasEffect'].length; k++) {
                                                if (kb['hasEffect'][k]['s'] === balance[balanceIndex]) {
                                                    if (kb['hasEffect'][k]['pu'] !== unit) {
                                                        plans.push(kb['hasEffect'][k]['pu'])
                                                    } else {
                                                        tripleValue += `
                                                        :Effect_${unit}_${value}_inBalance rdf:type :SetMember.
                                                        ${planComment(`Effect_${unit}_${value}_inBalance`, plans)}
                                                        :Effect_${unit}_${value}_inBalance :hasData :${value}_inBalance.
                                                        :Effect_${unit}_${value}_inBalance :isMemberOf :Effect_${unit}.
                                                        
                                                        `
                                                    }
                                                }
                                            }
                                        }

                                        plans = Array.from(new Set(plans))

                                        const planPreEff = (p: any, stake: any, balance: any) => {
                                            let c = ''
                                            for (let planIndex = 0; planIndex < p.length; planIndex++) {
                                                let stakePrePlan = ''
                                                let stakeEffPlan = ''
                                                for (let stakeIndex = 0; stakeIndex < stake.length; stakeIndex++) {
                                                    for (let k = 0; k < kb['hasPrecondition'].length; k++) {
                                                        if (kb['hasPrecondition'][k]['s'] === stake[stakeIndex] &&
                                                            kb['hasPrecondition'][k]['pu'] === p[planIndex]) {
                                                            stakePrePlan = 'atStake'
                                                        }
                                                    }
                                                    for (let k = 0; k < kb['hasEffect'].length; k++) {
                                                        if (kb['hasEffect'][k]['s'] === stake[stakeIndex] &&
                                                            kb['hasEffect'][k]['pu'] === p[planIndex]) {
                                                            stakeEffPlan = 'atStake'
                                                        }
                                                    }
                                                }

                                                for (let balanceIndex = 0; balanceIndex < balance.length; balanceIndex++) {
                                                    for (let k = 0; k < kb['hasPrecondition'].length; k++) {
                                                        if (kb['hasPrecondition'][k]['s'] === balance[balanceIndex] &&
                                                            kb['hasPrecondition'][k]['pu'] === p[planIndex]) {
                                                            stakePrePlan = 'inBalance'
                                                        }
                                                    }
                                                    for (let k = 0; k < kb['hasEffect'].length; k++) {
                                                        if (kb['hasEffect'][k]['s'] === balance[balanceIndex] &&
                                                            kb['hasEffect'][k]['pu'] === p[planIndex]) {
                                                            stakeEffPlan = 'inBalance'
                                                        }
                                                    }
                                                }

                                                if (stakeEffPlan !== '' && stakePrePlan !== '') {
                                                    c += `
                                                    :Precondition_${p[planIndex]}_${value}_${stakePrePlan} rdf:type :SetMember.
                                                    ${comments(commentIndex, p[planIndex], `Precondition_${p[planIndex]}_${value}_${stakePrePlan}`)}
                                                    :Precondition_${p[planIndex]}_${value}_${stakePrePlan} :hasData :${value}_${stakePrePlan}.
                                                    :Precondition_${p[planIndex]}_${value}_${stakePrePlan} :isMemberOf :precondition_${p[planIndex]}.
                                                    :Effect_${p[planIndex]}_${value}_${stakeEffPlan} rdf:type :SetMember.
                                                    ${comments(commentIndex, p[planIndex], `Effect_${p[planIndex]}_${value}_${stakeEffPlan}`)}
                                                    :Effect_${p[planIndex]}_${value}_${stakeEffPlan} :hasData :${value}_${stakeEffPlan}.
                                                    :Effect_${p[planIndex]}_${value}_${stakeEffPlan} :isMemberOf :effect_${p[planIndex]}.
                                                    `
                                                }
                                            }
                                            return c
                                        }

                                        tripleValue += `
                                            :${value}_atStake rdf:type :Value.
                                            :${value}_atStake :atStake true.
                                            ${planComment(`${value}_atStake`, plans)}
                                            :${value}_atStake :isValueEngagedOf :${agent}.
                                            :${value}_inBalance rdf:type :Value.
                                            :${value}_inBalance :atStake false.
                                            ${planComment(`${value}_inBalance`, plans)}
                                            :${value}_inBalance :isValueEngagedOf :${agent}.
                                            :${value}_schema rdf:type :ValueSchema.
                                            ${planComment(`${value}_schema`, plans)}
                                            :${value}_schema :describes :${value}_atStake.
                                            :${value}_schema :describes :${value}_inBalance.
                                            ${planPreEff(plans, stake, balance)}
                                        `;

                                    }
                                }

                                const BATCH_SIZE = 4;
                                const triples = tripleValue.split('\n'); // Divide le triple per riga
                                for (let i = 0; i < triples.length; i += BATCH_SIZE) {
                                    const batch = triples.slice(i, i + BATCH_SIZE).join('\n');
                                    await sendBatchQuery(batch);
                                }


                            } else if(t === 'DifferentFromAgent'){
                                let query = ``

                                if (Object.keys(kb).includes('Agent')) {

                                    query = `
                                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                                    PREFIX : <http://www.purl.org/drammar#>
                                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                                    PREFIX owl: <http://www.w3.org/2002/07/owl#>
                                    
                                    INSERT {
                                      ?agent1 owl:differentFrom ?agent2 .
                                    }
                                    WHERE {
                                      ?agent1 rdf:type :Agent .
                                      ?agent2 rdf:type :Agent .
                                      FILTER(?agent1 != ?agent2) .
                                      FILTER(?label1 != ?label2) .
                                    }
                                
                                `
                                    await axios.post(variables.API_URL_POST, query, {
                                        headers: {
                                            'Content-Type': 'application/sparql-update'
                                        }
                                    });
                                }
                            }
                        } catch
                            (err) {
                            console.error(err);
                        }
                    }
                ;
                const fetchDataSequentially = async () => {
                    if (Object.keys(kb).includes('Unit')) {
                        setLoading(true);
                        await fetchDataInsert('Unit');

                        if (Object.keys(kb).includes('Plan')) {
                            await fetchDataInsert('Plan');


                            if (Object.keys(kb).includes('Goal')) {
                                await fetchDataInsert('Goal');
                            }

                            if (Object.keys(kb).includes('Agent')) {
                                await fetchDataInsert('Agent');
                            }

                            if (Object.keys(kb).includes('Agent')) {
                                await fetchDataInsert('DifferentFromAgent');
                            }

                            if (Object.keys(kb).includes('Agent')) {
                                await fetchDataInsert('Emotion');
                            }

                            if (Object.keys(kb).includes('Value')) {
                                await fetchDataInsert('Value');
                            }
                        }

                        setLoading(false);
                    }
                }
                fetchDataSequentially().then()
            }
        }
        ,
        // eslint-disable-next-line
        [kb]
    )
    ;
    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        readFile(file);
    };

    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        readFile(file);
    };

    const readFile = (file: File) => {
        const reader = new FileReader();
        setFileName(file.name); // Set the file name when the file is uploaded

        reader.onload = (e) => {
            const text = e.target!.result;
            const parsedData = parseText(text);
            setKb(parsedData);
        };

        reader.readAsText(file);
    };

    const parseText = (text: any) => {
        const lines = text.split('&');
        const result: any = {};

        lines.forEach((line: { split: (arg0: string) => [any, any]; }) => {
            const [key, value] = line.split('(');
            const cleanKey = key.trim();
            const cleanValue = value.replace(')', '').trim();

            if (cleanKey === 'hasValue') {
                const [a, v] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), v: v.trim()});
            } else if (cleanKey === 'hasGoal') {
                const [a, g] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), g: g.trim()});
            } else if (cleanKey === 'intends') {
                const [a, p] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), p: p.trim()});
            } else if (cleanKey === 'achieves') {
                const [p, g] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p: p.trim(), g: g.trim()});
            } else if (cleanKey === 'hasPrecondition') {
                const [pu, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({pu: pu.trim(), s: s.trim()});
            } else if (cleanKey === 'hasEffect') {
                const [pu, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({pu: pu.trim(), s: s.trim()});
            } else if (cleanKey === 'atStakeInSet') {
                const [v, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({v: v.trim(), s: s.trim()});
            } else if (cleanKey === 'inBalanceInSet') {
                const [v, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({v: v.trim(), s: s.trim()});
            } else if (cleanKey === 'isMotivationFor') {
                const [p, u] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p: p.trim(), u: u.trim()});
            } else if (cleanKey === 'inConflictWith') {
                const [p1, p2] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p1: p1.trim(), p2: p2.trim()});
            } else if (cleanKey === 'inSupportOf') {
                const [p1, p2] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p1: p1.trim(), p2: p2.trim()});
            } else if (cleanKey === 'Like') {
                const [a, ao] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), ao: ao.trim()});
            } else if (cleanKey === 'Dislike') {
                const [a, ao] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), ao: ao.trim()});
            } else if (cleanKey === 'precedes') {
                const [p1, p2] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p1: p1.trim(), p2: p2.trim()});
            } else if (cleanKey === 'follows') {
                const [p1, p2] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p1: p1.trim(), p2: p2.trim()});
            } else {
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push(cleanValue);
            }
        });

        return result;
    };

    return (
        <div className={'import'}>
            <Box
                sx={{
                    padding: 3,
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    textAlign: 'center',
                    position: 'relative',
                    '&:hover': {
                        backgroundColor: '#f5f5f5',
                    },
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
            >
                <Stack direction="column" alignItems="center" spacing={2}>
                    <CloudUploadIcon sx={{fontSize: 50, color: '#1976d2'}}/>
                    <Typography variant="h6">Drag and drop your file here, or</Typography>
                    <Button variant="contained" component="label" startIcon={<CloudUploadIcon/>}>
                        Import File
                        <input type="file" accept=".txt" onChange={handleFileUpload} hidden/>
                    </Button>
                </Stack>

                {fileName && (
                    <Box sx={{marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <CheckCircleIcon sx={{color: 'green', marginRight: 1}}/>
                        <Typography variant="body1">
                            File <strong>{fileName}</strong> Uploaded successfully!
                        </Typography>
                    </Box>
                )}
                {loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', marginTop: 2}}>
                        Uploading On Triple Store <CircularProgress sx={{margin: 1}}/>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Import;
