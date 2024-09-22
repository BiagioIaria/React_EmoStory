import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import React from 'react';
import './App.css';
import Help from "./page/Help";
import Home from "./page/Home";
import {Box, Container, Grid} from "@mui/material";

import Edit from "./page/Edit";
import Import from "./page/import";
import Summary from "./page/Summary";


function App() {
    return (<div className="App">
        <Router>
            {Header()}
            <article>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/help" element={<Help/>}/>
                    <Route path="/edit" element={<Edit/>}/>
                    <Route path="/summary" element={<Summary/>}/>
                    <Route path="/import" element={<Import/>}/>
                </Routes>
            </article>
            {Footer()}
        </Router>
    </div>);
}

function Header() {

    return (<header className="header">
        <div className="buttons">
        <span className="buttons1">
          <Link to='/'>
            <Button variant="outlined" className="custom-button">
              Home
            </Button>
          </Link>
        </span>
            <span className="buttons2">
          <Link to='/help'>
            <Button variant="outlined" className="custom-button help-button">
              Help
            </Button>
          </Link>
        </span>
        </div>
    </header>);
}

function Footer() {

    return (
        <Box sx={{padding: '5em'}}>
            <Container maxWidth="lg">
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12}>
                        <Link to='/help'>
                            <Button variant="outline-secondary" className="square border border-5">
                                Help
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default App;