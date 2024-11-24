import React, {useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {CheckBox, ParamTable} from "./components";
import { CalculationProblemInfo } from "./problem_info";
import { Canvas } from "./components";
import {loadFile} from "../file/file";
import { renderMesh } from "../draw/draw";

export function ProblemForm(props)  {
    const [mesh, setMesh] = React.useState(null);
    const [numThread, setNumThread] = React.useState((props.data == null) ? 1 : props.data.NumThread);
    const [eps, setEps] = React.useState((props.data == null) ? 1.0E-6 : props.data.Eps);
    const [variables, setVariables] = React.useState((props.data== null) ? [["eps", "0.001"]] : props.data.Variables);
    const [youngModulus, setYoungModulus] = React.useState((props.data == null) ? [["", ""]] : props.data.YoungModulus);
    const [poissonRatio, setPoissonRatio] = React.useState((props.data == null) ? [["", ""]] : props.data.PoissonRatio);
    const [thickness, setThickness] = React.useState((props.data == null) ? [["", ""]] : props.data.Thickness);
    const [volumeLoad, setVolumeLoad] = React.useState((props.data == null) ? [["", "", "0"]] : props.data.VolumeLoad);
    const [surfaceLoad, setSurfaceLoad] = React.useState((props.data == null) ? [["", "", "0"]] : props.data.SurfaceLoad);
    const [pressureLoad, setPressureLoad] = React.useState((props.data == null) ? [["", ""]] : props.data.PressureLoad);
    const [pointLoad, setPointLoad] = React.useState((props.data == null) ? [["", "", "0"]] : props.data.PointLoad);
    const [boundaryCondition, setBoundaryCondition] = React.useState((props.data == null) ? [["", "", "0"]] : props.data.BoundaryCondition);
    const [meshFileName] = React.useState((props.data == null) ? null : props.data.Mesh);
    const [problemInfo, setProblemInfo] = React.useState(null);
    const [calculating, setCalculating] = React.useState(false);
    const [isMeshVisible, setIsMeshVisible] = React.useState(false);

    useEffect(() => {
        if (props.data == null) {
            setNumThread(navigator.hardwareConcurrency);
        }
    }, [props]);
    if (calculating) {
        return (
            <div>
                <label> Calculating...</label><br/>
                <div className="spinner"></div>
            </div>

        );
    }
    if (problemInfo) {
        return (
            <div>
                <CalculationProblemInfo problemInfo={problemInfo}/>
            </div>
        );
    }

    return (
        <form>
            {(props.data == null) ? <h1>New Problem</h1> : <h1>Saved Problem ({meshFileName.split('/').pop()})</h1>}
            <fieldset>
                <legend>Mesh</legend>
                <label>File name:<br/>
                    <input type="file" name="mesh_file" id="get_files" key="mesh" onChange={(event) => {
                        //setMesh(event.target.files[0]);
                        //setIsMeshVisible(true);

                        loadFile(event.target.files[0]).then((value) => {
                            setMesh(event.target.files[0]);
                            renderMesh.setMesh(value.mesh);
                        }).catch(() => {
                            alert("Failed to load file!")
                        });
                    }}/>
                    <CheckBox isChecked={isMeshVisible} caption={"View"}
                              updateData={() => {
                                  setIsMeshVisible(!isMeshVisible);
                              }}/>

                    <div style={{ position: 'sticky', display: isMeshVisible ? 'block' : 'none'}}>
                        <Canvas id={"gl"} updateData={() => {
                        }}/>
                        <Canvas id={"text"} updateData={() => {
                        }}/>
                    </div>
                </label>
            </fieldset>
            <fieldset>
                <legend>Base settings</legend>
                <label>Threads:<br/>
                    <input type="number" name="threads" key="threads" min={1} value={numThread}
                           max={1000} onChange={(e) => {
                        setNumThread(e.target.value);
                    }} id="get_threads"/>
                </label><br/>
                <label>Tolerance:<br/>
                    <input type="number" name="eps" value={eps}
                           onChange={(e) => {
                               setEps(parseFloat(e.target.value));
                           }} id="get-eps"/>
                </label><br/>
            </fieldset>
            <fieldset>
                <legend>Variables</legend>
                <ParamTable headers={["Name", "Value"]} data={variables} colType={["str", "num"]}
                            direct="off" updateData={setVariables}/>
            </fieldset>
            <fieldset>
                <legend>Elastic parameters</legend>
                <label>Young modulus:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={youngModulus}
                                colType={["str", "str"]} direct="off" updateData={setYoungModulus}/>
                </label><br/>
                <label>Poisson's ratio:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={poissonRatio}
                                colType={["str", "str"]} direct="off" updateData={setPoissonRatio}/>
                </label>
            </fieldset>
            <fieldset>
                <legend>Finite element parameters</legend>
                <label>Thickness:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={thickness}
                                colType={["str", "str"]} direct="off" updateData={setThickness}/>
                </label>
            </fieldset>
            <fieldset>
                <legend>Loads and boundary conditions</legend>
                <label>Volume loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={volumeLoad}
                                colType={["str", "str"]} direct="on" updateData={setVolumeLoad}/>
                </label><br/>
                <label>Point loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={pointLoad}
                                colType={["str", "str"]} direct="on" updateData={setPointLoad}/>
                </label><br/>
                <label>Surface loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={surfaceLoad}
                                colType={["str", "str"]} direct="on" updateData={setSurfaceLoad}/>
                </label><br/>
                <label>Pressure loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={pressureLoad}
                                colType={["str", "str"]} direct="off" updateData={setPressureLoad}/>
                </label><br/>
                <label>Boundary conditions:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={boundaryCondition}
                                colType={["str", "str"]} direct="on" updateData={setBoundaryCondition}/>
                </label>
            </fieldset>
            <input type="button" onClick={async () => {
                setCalculating(true);
                setProblemInfo(null);
                const formData = new FormData();
                formData.append('mesh', mesh);
                formData.append('threads', numThread);
                formData.append('eps', eps);
                formData.append('variables', variables);
                formData.append('youngModulus', youngModulus);
                formData.append('poissonRatio', poissonRatio);
                formData.append('thickness', thickness);
                formData.append('volumeLoad', volumeLoad);
                formData.append('surfaceLoad', surfaceLoad);
                formData.append('pointLoad', pointLoad);
                formData.append('pressureLoad', pressureLoad);
                formData.append('boundaryCondition', boundaryCondition);
                formData.append('meshFileName', meshFileName);
                axios.post('http://localhost:8001/problem', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                    .then(response => {
                        console.log('File uploaded successfully:', response.data);
                        setCalculating(false);
                        setProblemInfo(response.data);
                    })
                    .catch(error => {
                        setCalculating(false);
                        setProblemInfo(null);
                        console.error('Error loading file:', error);
                        alert('Error: ' + error.toString())
                    });
            }} value="Calculate"/>
            <br/>
            <br/>
            <Link to="/">Home</Link>
        </form>
    )
}
