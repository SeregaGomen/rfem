import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {MainForm} from "./ui/forms";
import {MeshForm} from "./ui/mesh";
import {ProblemForm} from "./ui/problem";
import {LoadProblemForm} from "./ui/load";
import {Router} from './router'


const mapping = {
    '#mesh': <MeshForm />,
    '#problem': <ProblemForm />,
    '#load': <LoadProblemForm />,
    '*': <MainForm />
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <Router mapping={mapping} />
);

