import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainForm } from "./ui/main"
import { ProblemForm } from "./ui/problem"
import { LoadProblemForm } from "./ui/problem_open";
import {ViewResultsForm} from "./ui/view_results";
// import { MeshForm } from "./ui/mesh"
import './app.css';


export function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainForm/>} />
                    {/*<Route exact path="/mesh" element={<MeshForm/>}/>*/}
                    <Route exact path="/new-problem" element={<ProblemForm/>}/>
                    <Route exact path="/open-problem" element={<LoadProblemForm/>}/>
                    <Route exact path="/view-results" element={<ViewResultsForm/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

