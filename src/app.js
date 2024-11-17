import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainForm } from "./ui/main"
import { MeshForm } from "./ui/mesh"
import { ProblemForm } from "./ui/problem"
import { LoadProblemForm } from "./ui/open_problem";
import './app.css';


export function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainForm/>} />
                    <Route exact path="/mesh" element={<MeshForm/>}/>
                    <Route exact path="/problem" element={<ProblemForm/>}/>
                    <Route exact path="/list" element={<LoadProblemForm/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

