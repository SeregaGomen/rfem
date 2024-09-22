import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainForm } from "./ui/main"
import { MeshForm } from "./ui/mesh"
import { ProblemForm } from "./ui/problem"
import './app.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainForm/> } />
          <Route exact path="/mesh" element={<MeshForm/>}/>
          <Route exact path="/problem" element={<ProblemForm/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
