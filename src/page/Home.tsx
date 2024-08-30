import AddIcon from '@mui/icons-material/Add';
import {Box, Chip, createTheme, IconButton, Menu, MenuItem, Stack, ThemeProvider} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {variables} from "../endPoint";

const themeChip = createTheme({
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ADD8E6',
                    color: 'black',
                    '&:hover': {
                        backgroundColor: '#87CEEB',
                    },
                },
            },
        },
    },
});

function Home() {
    const [anchorEls, setAnchorEls] = useState([]);
    const [unit, setUnit] = useState([]);
    const [stateDelete, setStateDelete] = useState('');

    function setUnitQuery(data: any) {
        const elabData = data.map((item: { [x: string]: { [x: string]: any; }; }) => {
            return item['Unit']['value'];
        });
        setUnit(elabData);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = `
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX : <http://www.purl.org/drammar#>
                    
                    SELECT (STRAFTER(STR(?individuo), "#")AS ?Unit)
                    WHERE {
                      ?individuo rdf:type :Unit .
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

                setUnitQuery(response.data['results']['bindings']);
            } catch (err) {
                console.log(err);
            }
        };

        fetchData().then();
    }, [stateDelete]);

    const handleClick = (event: any, index: number) => {
        const newAnchorEls: any = anchorEls.slice();
        newAnchorEls[index] = event.currentTarget;
        setAnchorEls(newAnchorEls);
    };

    const handleClose = (index: number) => {
        const newAnchorEls: any = anchorEls.slice();
        newAnchorEls[index] = null;
        setAnchorEls(newAnchorEls);
    };

    const handleDeleteUnit = async (unit: string) => {
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
                          ?individual rdfs:comment ?comment.
                          FILTER(STRSTARTS(?comment, "${unit}"))
                          OPTIONAL {
                            ?individual ?p ?o .
                          }
                          OPTIONAL {
                            ?s ?p2 ?individual .
                          }
                        }

                        `;

            const res = await axios.post(variables.API_URL_POST, query, {
                headers: {
                    'Content-Type': 'application/sparql-update'
                }
            });

            setStateDelete(String(res) + '_' + unit)
        } catch (error) {
            console.error('Errore durante l\'esecuzione della query SPARQL:', error);
        }
    };

    return (
        <div className={'home'}>
            <Box sx={{display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%'}}>
                <ThemeProvider theme={themeChip}>
                    <Stack direction="row" spacing={1}>
                        {unit.map((item, index) => (
                            <div key={'Unit' + index}>
                                <Chip onClick={(event) => handleClick(event, index)} label={item}
                                      style={{marginTop: '0.8em'}}/>
                                <Menu
                                    anchorEl={anchorEls[index]}
                                    open={Boolean(anchorEls[index])}
                                    onClose={() => handleClose(index)}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <Box sx={{display: 'flex', flexDirection: 'row', p: 1}}>
                                        <MenuItem onClick={() => { handleDeleteUnit(item).then(); handleClose(index); }}>
                                            <DeleteIcon sx={{mr: 1}}/> Delete
                                        </MenuItem>
                                    </Box>
                                </Menu>
                            </div>
                        ))}
                        <IconButton
                            aria-label="add"
                            size="large"
                            onClick={(event) => handleClick(event, unit.length)}
                        >
                            <AddIcon fontSize="inherit"/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEls[unit.length]}
                            open={Boolean(anchorEls[unit.length])}
                            onClose={() => handleClose(unit.length)}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            <Box sx={{display: 'flex', flexDirection: 'row', p: 1}}>
                                <MenuItem onClick={() => handleClose(unit.length)}>
                                    <Link to='/edit?temp=1' style={{textDecoration: 'none', color: 'inherit'}}>
                                        <EditIcon sx={{mr: 1}}/> Edit 1
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={() => handleClose(unit.length)}>
                                    <Link to='/edit?temp=2' style={{textDecoration: 'none', color: 'inherit'}}>
                                        <EditIcon sx={{mr: 1}}/> Edit 2
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={() => handleClose(unit.length)}>
                                    <Link to='/edit?temp=3' style={{textDecoration: 'none', color: 'inherit'}}>
                                        <EditIcon sx={{mr: 1}}/> Edit 3
                                    </Link>
                                </MenuItem>
                            </Box>
                        </Menu>
                    </Stack>
                </ThemeProvider>
            </Box>
        </div>
    );
}

export default Home;
