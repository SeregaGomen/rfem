import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {MainForm} from "./ui/main"
import {ProblemForm} from "./ui/problem"
import {LoadProblemForm} from "./ui/problem_open";
import {OpenResultsFileForm} from "./ui/view_results";
import './app.css';

window.serverURL = "http://localhost:8001";

export function App() {
    const query = new URLSearchParams(window.location.search);
    const url = query.get('server');

    if (url != null) {
        window.serverURL = url;
    }

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainForm/>} />
                    {/*<Route exact path="/mesh" element={<MeshForm/>}/>*/}
                    <Route exact path="/new-problem" element={<ProblemForm/>}/>
                    <Route exact path="/open-problem" element={<LoadProblemForm/>}/>
                    <Route exact path="/view-results" element={<OpenResultsFileForm/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

