import {useLocation} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {variables} from "../endPoint";
import {Box, Button, CircularProgress, Container, List, ListItem, ListItemText, Typography} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function useParams() {
    return new URLSearchParams(useLocation().search);
}

interface EmoForAgent {
    agent: string;
    Emo: string[];
}
function Summary() {
    let params = useParams();
    const unitParam = params.get("unit");
    const [data, setData] = useState([]);
    const [emoInf, setEmoInf] = useState([]);
    const [emoForAgent, setEmoForAgent] = useState<EmoForAgent[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingExp, setLoadingExp] = useState(false);


    function setDataQuery(data: any) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Agent']['value'];
        });
        setData(elabData);
    }

    useEffect(() => {
        if (emoInf.length !== 0 && data.length !== 0) {
            const EmoForAgent = (): EmoForAgent[] => {
                const result: { [key: string]: string[] } = {};

                emoInf.forEach(emotion => {
                    const agent = emotion['i']['value'];
                    const emo = String(emotion['emo']['value']).split('#')[1].split('_')[0];

                    if (!result[agent]) {
                        result[agent] = [];
                    }
                    result[agent].push(emo);
                });

                return data.map(agent => ({
                    agent: agent,
                    Emo: result[agent] || []
                }));
            };
            const ris: any = EmoForAgent()
            setEmoForAgent(ris)
        }
        // eslint-disable-next-line
    }, [emoInf, data])
    useEffect(() => {
        async function fetchData() {
            const query = `
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX : <http://www.purl.org/drammar#>
                    
                    SELECT DISTINCT (STRAFTER(STR(?agent), "#")AS ?Agent)
                    WHERE {
                        ?agent rdf:type :Agent .
                        ?agent rdfs:comment ?comment .
                        FILTER (STRSTARTS(?comment, "${unitParam}"))
                    }
                `;

            try {
                const response = await axios.get(variables.API_URL_GET, {
                    params: {
                        query: query,
                        format: 'json'
                    },
                    headers: {
                        'Accept': 'application/sparql-results+json'
                    }
                });

                const results = response.data.results.bindings;

                setDataQuery(results)
            } catch (error) {
                console.error('Errore durante la richiesta SPARQL:', error);
            }
        }

        async function inference() {
            setLoading(true)
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
        }

        const fetchAll = async () => {
            try {
                await fetchData()
                await inference()
            } catch (error) {
                console.error('Errore durante l\'aggiornamento dei dati:', error);
            }
        };

        fetchAll().then();
        // eslint-disable-next-line
    }, []);

    const handleClickExport = async () => {
        setLoadingExp(true);

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

    return (
        <Container>
            <Box my={4}>
                {emoForAgent.map(({agent, Emo}) => (
                    <Box key={agent} mb={4}>
                        <Typography variant="h5" component="h2">
                            {agent.replace(/_/g, ' ')}
                        </Typography>
                        <List>
                            {Emo.map((emo: any, index: any) => (
                                <ListItem key={index}>
                                    <ListItemText primary={emo}/>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ))}
                {loading && (
                    <Box mt={2}>
                        <CircularProgress/>
                    </Box>
                )}
            </Box>
            {!loading && (<Button
                variant="contained"
                onClick={handleClickExport}
                startIcon={<DownloadIcon/>}
                color="primary"
                disabled={loadingExp}
            >
                Export rdf
            </Button>)}
            {loadingExp && (
                <Box mt={2}>
                    <CircularProgress/>
                </Box>
            )}
        </Container>
    );
}

export default Summary;
