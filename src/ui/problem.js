import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { CheckBox, ParamTable } from "./components";
import { CalculationProblemInfo } from "./problem_info";
import { Canvas } from "./components";
import { loadFile } from "../file/file";
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

    const [progress, setProgress] = useState({ status: 'in_progress', percent_complete: 0 });

    useEffect(() => {
        if (props.data == null) {
            setNumThread(navigator.hardwareConcurrency);
        }

        const interval = setInterval(() => {
            fetch('http://localhost:8001/progress')
                .then(response => response.json())
                .then(data => setProgress(data))
                .catch(error => console.error('Error fetching data:', error));
        }, 1000);

        return () => clearInterval(interval);

    }, [props]);
    if (calculating) {
        return (
            // <div>
            //     <label> Calculating...</label><br/>
            //     <div className="spinner"></div>
            // </div>
            <div>
                <h1>Progress: {progress.percent_complete}%</h1>
                <p>Status: {progress.status}</p>
                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#ccc',
                        borderRadius: '5px',
                        margin: '20px 0',
                    }}
                >
                    <div
                        style={{
                            width: `${progress.percent_complete}%`,
                            height: '30px',
                            backgroundColor: 'green',
                            borderRadius: '5px',
                        }}
                    />
                </div>
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
                        if (event.target.files.length === 0) {
                            setIsMeshVisible(false);
                            setMesh(null);
                        } else {
                            loadFile(event.target.files[0]).then((value) => {
                                setMesh(event.target.files[0]);
                                renderMesh.setMesh(value.mesh);
                            }).catch(() => {
                                alert("Failed to load file!")
                            });
                        }
                    }}/>
                    <CheckBox isChecked={isMeshVisible} caption={"View"} disabled={mesh === null && props.data === undefined}
                              updateData={async () => {
                                  setIsMeshVisible(!isMeshVisible);
                                  if (props.data !== undefined) {
                                      const formData = new FormData();
                                      formData.append('meshName', props.data.Mesh);
                                      axios.post('http://localhost:8001/load_mesh', formData, {
                                          headers: {
                                              'Content-Type': 'text/plain',
                                          },
                                      })
                                          .then((response) => {
                                              let msh = {};
                                              switch (response.data.FeType) {
                                                  case 1:
                                                      msh.feType = "fe2d3";
                                                      break;
                                                  case 2:
                                                      msh.feType = "fe2d4";
                                                      break;
                                                  case 3:
                                                      msh.feType = "fe3d4";
                                                      break;
                                                  case 4:
                                                      msh.feType = "fe3d8";
                                                      break;
                                                  case 5:
                                                      msh.feType = "fe3d3s";
                                                      break;
                                                  case 6:
                                                      msh.feType = "fe3d4s";
                                                      break;
                                                  default:
                                                      alert("Wrong mesh format!");
                                                      return;
                                              }
                                              msh.feType = "fe3d4";
                                              msh.x = response.data.X;
                                              msh.fe = response.data.FE;
                                              msh.be = response.data.BE;
                                              msh.func = [];

                                              renderMesh.setMesh(msh);
                                          })
                                          .catch((error) => {
                                              alert("Error: " + error);
                                          });
                                  }
                              }}/>

                    <div style={{ position: 'sticky', display: isMeshVisible ? 'block' : 'none'}}>
                        <Canvas id={"gl"}/>
                        <Canvas id={"text"}/>
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
