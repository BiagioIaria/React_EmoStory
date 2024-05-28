import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import React from 'react';
import './App.css';
import Home from "./page/Home";


function App() {
  return (<div className="App">
    <Router>
      {Header()}
      <article>
        <Routes>
          <Route path="/" element={<Home/>}/>
        </Routes>
      </article>
    </Router>
  </div>);
}

function Header() {

  return (<header>
        <span className="buttons1">
            <Link to='/'>
                <Button variant="outline-secondary" className="square border border-5">
                    Home
                </Button>
            </Link>
        </span>
  </header>);
}

export default App;