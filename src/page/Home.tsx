import AddIcon from '@mui/icons-material/Add';
import {Box, Chip, createTheme, IconButton, Menu, MenuItem, Stack, ThemeProvider} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import {Link} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import axios from "axios";

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
    const [anchorEl, setAnchorEl] = useState(null);
    const [unit, setUnit] = useState([]);
    const menuOpen = Boolean(anchorEl);
    const iconButtonRef = useRef(null);

    function setUnitQuery(data: any) {
        const elabData = data.map((item: any) => {
            return item['Unit']['value']
        });
        setUnit(elabData)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpointUrl = 'http://localhost:7200/repositories/emoStory?';
                const query = `
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX : <http://www.purl.org/drammar#>
                    
                    SELECT (STRAFTER(STR(?individuo), "#")AS ?Unit)
                    WHERE {
                      ?individuo rdf:type :Unit .
                    }
                `;

                const response = await axios.get(endpointUrl, {
                    params: {
                        query,
                    },
                    headers: {
                        'Accept': 'application/sparql-results+json',
                    },
                });

                setUnitQuery(response.data['results']['bindings'])
            } catch (err) {
                console.log(err)
            }
        };

        fetchData().then();
    }, []);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={'home'}>
            <Box sx={{display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%'}}>
                <ThemeProvider theme={themeChip}>
                    <Stack direction="row" spacing={1}>
                        {unit.map((item, index) => (
                            <Chip key={'Unit' + index} label={item} style={{ marginTop: '0.8em' }}/>
                        ))}
                        <IconButton
                            aria-label="add"
                            size="large"
                            onClick={handleClick}
                            ref={iconButtonRef}
                        >
                            <AddIcon fontSize="inherit"/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleClose}
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
                                <MenuItem onClick={handleClose}>
                                    <Link to='/edit?temp=1' style={{textDecoration: 'none', color: 'inherit'}}>
                                        <EditIcon sx={{mr: 1}}/> Edit 1
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    <Link to='/edit?temp=2' style={{textDecoration: 'none', color: 'inherit'}}>
                                        <EditIcon sx={{mr: 1}}/> Edit 2
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
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