import React, {useEffect} from "react";
import axios from 'axios';
import { Link } from "react-router-dom";

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
                        setMesh(event.target.files[0]);
                    }}/>
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

function ParamTable(props)  {
    const [cols] = React.useState(props.data.length ? props.data[0].length ? props.data[0].length : 0 : 0);
    const rows = [];
    const headers = [];
    for (const title of props.headers) {
        headers.push(<th key={title} rowSpan="2">{title}</th>);
    }
    if (props.direct === "on") {
        headers.push(<th key="Direction" colSpan="4">Direction</th>);
    }
    for (let i = 0; i < props.data.length; i++) {
        let row = [];
        for (let j = 0; j < props.data[i].length; j++) {
            if (props.direct === "on" && j === props.data[i].length - 1) {
                continue;
            }
            row.push(<td key={i.toString() + "_" + j.toString()}>
                <input id={i.toString() + "_" + j.toString()} type={props.colType[j] === "str" ?
                    "text" : "number"} step="any" defaultValue={props.data[i][j]}
                       onChange={(event) => {
                           let row = Number(event.target.id.substring(0, event.target.id.search("_")));
                           let col = Number(event.target.id.substring(event.target.id.search("_") + 1, event.target.id.length));
                           let table = [...props.data];
                           table[row][col] = event.target.value;
                           props.updateData(table);
                       }}/>
            </td>);
        }
        if (props.direct === "on") {
            let mask = [1, 2, 4]; // X, Y or Z
            for (let j = 0; j < 3; j++) {
                let value = Number(props.data[i][props.data[i].length - 1]) & mask[j];
                row.push(
                    <td key={j}><input id={i.toString() + "_" + j.toString()} type="checkbox"
                                       checked={Boolean(value)}
                                       onChange={(event) => {
                                           let index = Number(event.target.id.substring(0, 1));
                                           let table = [...props.data];
                                           table[index][table[index].length - 1] ^= mask[j];
                                           props.updateData(table);
                                           //alert("New value: " + table[index][table[index].length - 1]);
                                       }}/>
                    </td>
                )
            }
        }
        rows.push(<tr key={i}>{row}</tr>);
    }
    return (
        <table>
            <thead>
            <tr>{headers}</tr>
            {props.direct === "on" ? <tr>
                <th key="X">X</th>
                <th key="Y">Y</th>
                <th key="Z">Z</th>
            </tr> : null}
            </thead>
            <tbody>{rows}
            <tr>
                <td>
                    <input type="button" value="add" onClick={() => {
                        let row = [];
                        for (let j = 0; j < cols; j++) {
                            if (props.direct === "on" && j === cols - 1) {
                                continue;
                            }
                            row.push("");
                        }
                        if (props.direct === "on") {
                            row.push(0);
                        }
                        let table = [...props.data, row];
                        props.updateData(table);
                    }}/>
                    <input type="button" value="del" disabled={!props.data.length} onClick={() => {
                        let table = [...props.data];
                        table.splice(table.length - 1, 1);
                        props.updateData(table);
                    }}/>
                </td>
            </tr>
            </tbody>
        </table>
    );
}

/**
 * @param props
 * @param props.problemInfo
 * @param props.problemInfo.Res
 * @param props.problemInfo.Res.Min
 * @param props.problemInfo.Res.Max
 * @param props.problemInfo.BoundaryCondition
 * @param props.problemInfo.BoundaryCondition.Value
 * @param props.problemInfo.BoundaryCondition.Predicate
 * @param props.problemInfo.BoundaryCondition.Direct
 * @param props.problemInfo.DateTime
 * @param props.problemInfo.Mesh
 * @param props.problemInfo.NameFE
 * @param props.problemInfo.NumFE
 * @param props.problemInfo.NumVertex
 * @param props.problemInfo.Results
 * @param props.problemInfo.LeadTime
 *
 */
function CalculationProblemInfo(props)  {
    let direct = (value, dir) => {
        return value & dir ? '+' : null;
    }
    let leadTime = props.problemInfo.LeadTime < 60 ? props.problemInfo.LeadTime
        .toFixed(2) + " sec" :
        new Date(1970, 0, 0, 0, 0,+props.problemInfo.LeadTime || 0)
            .toLocaleTimeString(new Intl.DateTimeFormat().resolvedOptions().locale)
    let format = (value) => {
        let res = value.toExponential(6).toString();
        if (Math.sign(value) !== -1) {
            res = "+" + res;
        }
        return res;
    }
    let res = props.problemInfo.Res.map((item) => (
        <tr><td>{item.Name}</td><td>{format(item.Min)}</td><td>{format(item.Max)}</td></tr>)
    );
    let variables = props.problemInfo.Variables ?
        props.problemInfo.Variables.map((item) => (
            <tr>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
            </tr>
        )) : [];
    let boundaryCondition = props.problemInfo.BoundaryCondition ?
        props.problemInfo.BoundaryCondition.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];
    let volumeLoad = props.problemInfo.VolumeLoad ?
        props.problemInfo.VolumeLoad.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];
    let surfaceLoad = props.problemInfo.SurfaceLoad ?
        props.problemInfo.SurfaceLoad.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];
    let pointLoad = props.problemInfo.PointLoad ?
        props.problemInfo.PointLoad.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];

    let pressureLoad = props.problemInfo.PressureLoad ?
        props.problemInfo.PressureLoad.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];
    let thickness = props.problemInfo.Thickness ?
        props.problemInfo.Thickness.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];
    let youngModulus = props.problemInfo.YoungModulus ?
        props.problemInfo.YoungModulus.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];
    let poissonRatio = props.problemInfo.PoissonRatio ?
        props.problemInfo.PoissonRatio.map((item) => (
            <tr>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];

    return (
        <div>
            <h1>The problem has been solving {props.problemInfo.DateTime}</h1>
            <h2>Results of calculation</h2>
            Lead time: {leadTime}<br/>
            Parameters of the stress-strain state:
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Function</td>
                    <td>Min</td>
                    <td>Max</td>
                </tr>
                </thead>
                <tbody>{res}</tbody>
            </table>

            <h2>Mesh</h2>
            File: {props.problemInfo.Mesh}<br/>
            Type: {props.problemInfo.NameFE}<br/>
            Nodes: {props.problemInfo.NumVertex}<br/>
            Finite elements: {props.problemInfo.NumFE}

            <h2>Base settings</h2>
            Threads: {props.problemInfo.NumThread}<br/>
            Tolerance: {props.problemInfo.Eps}<br/>

            {
                variables.length ?
                    <div>
                        <h2>Variables</h2>
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Name</td>
                                <td>Value</td>
                            </tr>
                            </thead>
                            <tbody>{variables}</tbody>
                        </table>
                        <br/>
                    </div> : null
            }

            <h2>Elasticity parameters</h2>
            Young modulus:
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Value</td>
                    <td>Predicate</td>
                </tr>
                </thead>
                <tbody>{youngModulus}</tbody>
            </table><br/>
            Poisson's ratio:
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Value</td>
                    <td>Predicate</td>
                </tr>
                </thead>
                <tbody>{poissonRatio}</tbody>
            </table>

            {
                thickness.length ?
                    <div>
                        <h2>Thickness</h2>
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                            </tr>
                            </thead>
                            <tbody>{thickness}</tbody>
                        </table>
                    </div> : null
            }


            <h2>Loads</h2>
            {
                volumeLoad.length ?
                    <div>
                        Volume load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                                <td>X</td>
                                <td>Y</td>
                                <td>Z</td>
                            </tr>
                            </thead>
                            <tbody>{volumeLoad}</tbody>
                        </table>
                    </div> : null
            }

            {
                surfaceLoad.length ?
                    <div>
                        Surface load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                                <td>X</td>
                                <td>Y</td>
                                <td>Z</td>
                            </tr>
                            </thead>
                            <tbody>{surfaceLoad}</tbody>
                        </table>
                    </div> : null
            }

            {
                pointLoad.length ?
                    <div>
                        Point load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                                <td>X</td>
                                <td>Y</td>
                                <td>Z</td>
                            </tr>
                            </thead>
                            <tbody>{pointLoad}</tbody>
                        </table>
                    </div> : null
            }

            {
                pressureLoad.length ?
                    <div>
                        Pressure load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                            </tr>
                            </thead>
                            <tbody>{pressureLoad}</tbody>
                        </table>
                    </div> : null
            }

            <h2>Boundary condition</h2>
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Value</td>
                    <td>Predicate</td>
                    <td>X</td>
                    <td>Y</td>
                    <td>Z</td>
                </tr>
                </thead>
                <tbody>{boundaryCondition}</tbody>
            </table>

            <br/>
            <input type="button" value="Download results" onClick={async () => {
                const fileUrl = 'http://localhost:8001/load_results?file=' + props.problemInfo.Results;
                try {
                    const response = await axios.get(fileUrl, {
                        responseType: 'blob', // Указываем, что ожидаем blob (файл)
                    });

                    // Создаем ссылку для скачивания файла
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', props.problemInfo.Results);
                    document.body.appendChild(link);
                    link.click();
                    link.remove(); // Удаляем ссылку из документа
                } catch (error) {
                    //console.error('Ошибка при загрузке файла:', error);
                    alert('Error downloading the file: ' + error);
                }
            }}/>
            <br/>
        </div>
    );
}
