import React from "react";
import axios from 'axios';
import {Link} from "react-router-dom";


export function ProblemForm() {
    const [mesh, setMesh] = React.useState(null);
    const [numThread, setNumThread] = React.useState(1);
    const [eps, setEps] = React.useState(1.0E-6);
    const [variables] = React.useState([["eps", "0.001"]]);
    const [youngModulus] = React.useState([["", ""]]);
    const [poissonRatio] = React.useState([["", ""]]);
    const [thickness] = React.useState([["", ""]]);
    const [volumeLoad] = React.useState([["", "", "0"]]);
    const [surfaceLoad] = React.useState([["", "", "0"]]);
    const [pressureLoad] = React.useState([["", ""]]);
    const [pointLoad] = React.useState([["", "", "0"]]);
    const [boundaryCondition] = React.useState([["", "", "0"]]);


    React.useEffect(() => {
        const cores = navigator.hardwareConcurrency;
        setNumThread(cores);
    }, []);


    return (
        <form>
            <h1>New Problem</h1>
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
                        setNumThread(parseInt(e.target.value));
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
                            direct="off"/>
            </fieldset>
            <fieldset>
                <legend>Elastic parameters</legend>
                <label>Young modulus:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={youngModulus}
                                colType={["str", "str"]} direct="off"/>
                </label><br/>
                <label>Poisson's ratio:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={poissonRatio}
                                colType={["str", "str"]} direct="off"/>
                </label>
            </fieldset>
            <fieldset>
                <legend>Finite element parameters</legend>
                <label>Thickness:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={thickness}
                                colType={["str", "str"]} direct="off"/>
                </label>
            </fieldset>

            <fieldset>
                <legend>Loads and boundary conditions</legend>
                <label>Volume loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={volumeLoad}
                                colType={["str", "str"]} direct="on"/>
                </label><br/>
                <label>Point loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={pointLoad}
                                colType={["str", "str"]} direct="on"/>
                </label><br/>
                <label>Surface loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={surfaceLoad}
                                colType={["str", "str"]} direct="on"/>
                </label><br/>
                <label>Pressure loads:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={pressureLoad}
                                colType={["str", "str"]} direct="off"/>
                </label><br/>
                <label>Boundary conditions:<br/>
                    <ParamTable headers={["Value", "Predicate"]} data={boundaryCondition}
                                colType={["str", "str"]} direct="on"/>
                </label>
            </fieldset>
            <input type="button" onClick={async () => {
                const formData = () => {
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
                    return formData;
                };
                axios.post('http://localhost:8001/problem', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                    .then(response => {
                        console.log('Файл успешно загружен:', response.data);
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке файла:', error);
                        alert('Error: ' + error.toString())
                    });
            }} value="Calculate"/>
            <br/>
            <br/>
            <Link to="/">Home</Link>
        </form>

    );

}

function ParamTable(props) {
    const [data, setData] = React.useState(props.data);
    const cols = props.data[0].length ? props.data[0].length : 0;
    const rows = [];
    const headers = [];
    for (const title of props.headers) {
        headers.push(<th key={title} rowSpan="2">{title}</th>);
    }
    if (props.direct === "on") {
        headers.push(<th key="Direction" colSpan="4">Direction</th>);
    }
    // prepare rows
    for (let i = 0; i < data.length; i++) {
        let row = [];
        for (let j = 0; j < data[i].length; j++) {
            if (props.direct === "on" && j === data[i].length - 1) {
                continue;
            }

            row.push(<td key={i.toString() + "_" + j.toString()}>
                <input id={i.toString() + "_" + j.toString()} type={props.colType[j] === "str" ?
                    "text" : "number"} step="any" defaultValue={data[i][j]}
                       onChange={(event) => {
                           let rowIndex = Number(event.target.id.substring(0, event.target.id.search("_")));
                           let colIndex = Number(event.target.id.substring(event.target.id.search("_") + 1, event.target.id.length));
                           let table = data;
                           table[rowIndex][colIndex] = event.target.value;
                           setData(table);
                       }}/></td>
            );
        }
        if (props.direct === "on") {
            let mask = [1, 2, 4]; // X, Y or Z
            for (let j = 0; j < 3; j++) {
                let value = Number(data[i][data[i].length - 1]) & mask[j];
                row.push(
                    <td key={j}><input id={i.toString() + "_" + j.toString()} type="checkbox"
                           checked={Boolean(value)}
                           onChange={(event) => {
                               let index = Number(event.target.id.substring(0, 1));
                               let newData = [...data];
                               newData[index][newData[index].length - 1] ^= mask[j];
                               setData(newData);
                           }}/>
                    </td>
                )
            }
        }
        rows.push(<tr>{row}</tr>);
    }

    return (
        <table>
            <thead>
                <tr>{headers}</tr>
                {props.direct === "on" ? <tr><th key="X">X</th><th key="Y">Y</th><th key="Z">Z</th></tr> : null}
            </thead>
            <tbody>{rows}
                <tr>
                    <td>
                        <input type="button" value="add" onClick={() => {
                            let newData = [...data];
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
                            newData.push(row);
                            setData(newData);
                        }}/>
                        <input type="button" value="del" disabled={!data.length} onClick={() => {
                            let newData = [...data];
                            newData.splice(newData.length - 1, 1);
                            setData(newData);
                        }}/>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
