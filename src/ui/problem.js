import React from "react";
import axios from 'axios';
import { Link } from "react-router-dom";

export class ProblemForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mesh: null,
            numThread: 1,
            eps: 1.0E-6,
            variables: [["eps", "0.001"]],
            youngModulus: [["", ""]],
            poissonRatio: [["", ""]],
            thickness: [["", ""]],
            volumeLoad: [["", "", "0"]],
            surfaceLoad: [["", "", "0"]],
            pressureLoad: [["", ""]],
            pointLoad: [["", "", "0"]],
            boundaryCondition: [["", "", "0"]],
        };
    }
    componentDidMount() {
        this.setState({numThread: navigator.hardwareConcurrency})
    }
    render() {
        return (
            <form>
                <h1>New Problem</h1>
                <fieldset>
                    <legend>Mesh</legend>
                    <label>File name:<br/>
                        <input type="file" name="mesh_file" id="get_files" key="mesh" onChange={(event) => {
                            this.setState({mesh: event.target.files[0]});
                        }}/>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Base settings</legend>
                    <label>Threads:<br/>
                        <input type="number" name="threads" key="threads" min={1} value={this.state.numThread}
                               max={1000} onChange={(e) => {
                            this.setState({numThread: e.target.value})
                        }} id="get_threads"/>
                    </label><br/>
                    <label>Tolerance:<br/>
                        <input type="number" name="eps" value={this.state.eps}
                               onChange={(e) => {
                                   this.setState({eps: parseFloat(e.target.value)})
                               }} id="get-eps"/>
                    </label><br/>
                </fieldset>
                <fieldset>
                    <legend>Variables</legend>
                    <ParamTable headers={["Name", "Value"]} data={this.state.variables} colType={["str", "num"]}
                                direct="off"/>
                </fieldset>
                <fieldset>
                    <legend>Elastic parameters</legend>
                    <label>Young modulus:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.youngModulus}
                                    colType={["str", "str"]} direct="off"/>
                    </label><br/>
                    <label>Poisson's ratio:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.poissonRatio}
                                    colType={["str", "str"]} direct="off"/>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Finite element parameters</legend>
                    <label>Thickness:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.thickness}
                                    colType={["str", "str"]} direct="off"/>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Loads and boundary conditions</legend>
                    <label>Volume loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.volumeLoad}
                                    colType={["str", "str"]} direct="on"/>
                    </label><br/>
                    <label>Point loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.pointLoad}
                                    colType={["str", "str"]} direct="on"/>
                    </label><br/>
                    <label>Surface loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.surfaceLoad}
                                    colType={["str", "str"]} direct="on"/>
                    </label><br/>
                    <label>Pressure loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.pressureLoad}
                                    colType={["str", "str"]} direct="off"/>
                    </label><br/>
                    <label>Boundary conditions:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.boundaryCondition}
                                    colType={["str", "str"]} direct="on"/>
                    </label>
                </fieldset>
                <input type="button" onClick={async () => {
                    const formData = new FormData();
                    formData.append('mesh', this.state.mesh);
                    formData.append('threads', this.state.numThread);
                    formData.append('eps', this.state.eps);
                    formData.append('variables', this.state.variables);
                    formData.append('youngModulus', this.state.youngModulus);
                    formData.append('poissonRatio', this.state.poissonRatio);
                    formData.append('thickness', this.state.thickness);
                    formData.append('volumeLoad', this.state.volumeLoad);
                    formData.append('surfaceLoad', this.state.surfaceLoad);
                    formData.append('pointLoad', this.state.pointLoad);
                    formData.append('pressureLoad', this.state.pressureLoad);
                    formData.append('boundaryCondition', this.state.boundaryCondition);
                    axios.post('http://localhost:8001/problem', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    })
                        .then(response => {
                            console.log('File uploaded successfully:', response.data);
                        })
                        .catch(error => {
                            console.error('Error loading file:', error);
                            alert('Error: ' + error.toString())
                        });
                }} value="Calculate"/>
                {/*<br/>*/}
                {/*<input type="button" value="Save" id="saveFile" style={{display: 'none'}} onClick={() => {*/}
                {/*    const jsonString = JSON.stringify(Object.fromEntries(this.getFormData()));*/}

                {/*    // Создаем Blob из строки JSON*/}
                {/*    const blob = new Blob([jsonString], {type: 'application/json'});*/}

                {/*    // Создаем ссылку для скачивания*/}
                {/*    const url = URL.createObjectURL(blob);*/}
                {/*    const link = document.createElement('a');*/}
                {/*    link.href = url;*/}
                {/*    link.download = 'data.json'; // Указываем имя файла для скачивания*/}

                {/*    // Программно вызываем клик по ссылке для скачивания файла*/}
                {/*    link.click();*/}

                {/*    // Освобождаем память, удаляя объект URL после скачивания*/}
                {/*    URL.revokeObjectURL(url);*/}
                {/*}}/>*/}
                {/*<label htmlFor="saveFile">Save</label>*/}
                {/*<br/>*/}

                {/*/!*https://developer.mozilla.org/ru/docs/Web/API/File_API/Using_files_from_web_applications*!/*/}
                {/*<input*/}
                {/*    type="file"*/}
                {/*    id="loadFile"*/}
                {/*    style={{display: 'none'}}*/}
                {/*    // multiple*/}
                {/*    // accept="image/*"*/}
                {/*    onChange={() => {*/}

                {/*    }}*/}
                {/*/>*/}
                {/*<label htmlFor="loadFile">Load</label>*/}
                <br/>
                <br/>
                <Link to="/">Home</Link>
            </form>

        )
    }
}

class ParamTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cols: this.props.data[0].length ? this.props.data[0].length : 0,
            data: this.props.data,
            colType: this.props.colType,
        };
    }

    render() {
        const rows = [];
        const headers = [];
        for (const title of this.props.headers) {
            headers.push(<th key={title} rowSpan="2">{title}</th>);
        }
        if (this.props.direct === "on") {
            headers.push(<th key="Direction" colSpan="4">Direction</th>);
        }
        for (let i = 0; i < this.props.data.length; i++) {
            let row = [];
            for (let j = 0; j < this.props.data[i].length; j++) {
                if (this.props.direct === "on" && j === this.props.data[i].length - 1) {
                    continue;
                }
                row.push(<td key={i.toString() + "_" + j.toString()}>
                    <input id={i.toString() + "_" + j.toString()} type={this.state.colType[j] === "str" ?
                        "text" : "number"} step="any" defaultValue={this.props.data[i][j]}
                           onChange={(event) => {
                               let row = Number(event.target.id.substring(0, event.target.id.search("_")));
                               let col = Number(event.target.id.substring(event.target.id.search("_") + 1, event.target.id.length));
                               let table = this.state.data;
                               table[row][col] = event.target.value;
                               this.setState({data: table});
                           }}/>
                </td>);
            }
            if (this.props.direct === "on") {
                let mask = [1, 2, 4]; // X, Y or Z
                for (let j = 0; j < 3; j++) {
                    let value = Number(this.state.data[i][this.state.data[i].length - 1]) & mask[j];
                    row.push(
                        <td key={j}><input id={i.toString() + "_" + j.toString()} type="checkbox"
                                           checked={Boolean(value)}
                                           onChange={(event) => {
                                               let index = Number(event.target.id.substring(0, 1));
                                               let table = this.state.data;
                                               table[index][table[index].length - 1] ^= mask[j];
                                               this.setState({data: table});
                                               //alert("New value: " + table[index][table[index].length - 1]);
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
                {this.props.direct === "on" ? <tr>
                    <th key="X">X</th>
                    <th key="Y">Y</th>
                    <th key="Z">Z</th>
                </tr> : null}
                </thead>
                <tbody>{rows}
                <tr>
                    <td>
                        <input type="button" value="add" onClick={() => {
                            let newData = this.state.data;
                            let row = [];
                            for (let j = 0; j < this.state.cols; j++) {
                                if (this.props.direct === "on" && j === this.state.cols - 1) {
                                    continue;
                                }
                                row.push("");
                            }
                            if (this.props.direct === "on") {
                                row.push(0);
                            }
                            newData.push(row);
                            this.setState({data: newData});
                        }}/>
                        <input type="button" value="del" disabled={!this.state.data.length} onClick={() => {
                            let newData = this.state.data;
                            newData.splice(newData.length - 1, 1);
                            this.setState({data: newData});
                        }}/>
                    </td>
                </tr>
                </tbody>
            </table>
        );
    }
}

