import React from "react";
import {WebCPU} from 'webcpu';
import axios from 'axios';
import {ParamTable} from "./primitives";

export class ProblemForm extends React.Component {
    constructor(props) {
        super(props);
        this.getNumCores().then(() => {});
        this.state = {
            mesh: null,
            fileName: "",
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

    async getNumCores() {
        let result = await WebCPU.detectCPU();
        this.setState({numThread: result.reportedCores})
    }

    getFormData() {
        const formData = new FormData();
        formData.append('mesh', this.state.mesh);
        formData.append('fileName', this.state.fileName);
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
        return formData;
    }

    render() {
        // WebCPU.detectCPU().then(result => {
        //     console.log(`Reported Cores: ${result.reportedCores}`);
        //     console.log(`Estimated Idle Cores: ${result.estimatedIdleCores}`);
        //     console.log(`Estimated Physical Cores: ${result.estimatedPhysicalCores}`);
        // });

        // <form action={"http://localhost:7878/"} method={"POST"}>

        return (
            <form>
                <h1>New Problem</h1>
                <fieldset>
                    <legend>Mesh</legend>
                    <label>File name:<br/>
                        <input type="file" name="mesh_file" id="get_files" key="mesh" onChange={(event) => {
                            this.setState({mesh: event.target.files[0]});
                            this.setState({fileName: event.target.files[0].name});
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
                    <ParamTable headers={["Name", "Value"]} data={this.state.variables} col_type={["str", "num"]}
                                direct="off"/>
                </fieldset>
                <fieldset>
                    <legend>Elastic parameters</legend>
                    <label>Young modulus:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.youngModulus}
                                    col_type={["str", "str"]} direct="off"/>
                    </label><br/>
                    <label>Poisson's ratio:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.poissonRatio}
                                    col_type={["str", "str"]} direct="off"/>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Finite element parameters</legend>
                    <label>Thickness:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.thickness}
                                    col_type={["str", "str"]} direct="off"/>
                    </label>
                </fieldset>

                <fieldset>
                    <legend>Loads and boundary conditions</legend>
                    <label>Volume loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.volumeLoad}
                                    col_type={["str", "str"]} direct="on"/>
                    </label><br/>
                    <label>Point loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.pointLoad}
                                    col_type={["str", "str"]} direct="on"/>
                    </label><br/>
                    <label>Surface loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.surfaceLoad}
                                    col_type={["str", "str"]} direct="on"/>
                    </label><br/>
                    <label>Pressure loads:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.pressureLoad}
                                    col_type={["str", "str"]} direct="off"/>
                    </label><br/>
                    <label>Boundary conditions:<br/>
                        <ParamTable headers={["Value", "Predicate"]} data={this.state.boundaryCondition}
                                    col_type={["str", "str"]} direct="on"/>
                    </label>
                </fieldset>
                <button onClick={async () => {
                    const formData = this.getFormData();
                    // try {
                    //     // Отправка данных на сервер через fetch
                    //     const response = await fetch('http://localhost:8001/problem', {
                    //         method: 'POST',
                    //         // headers: {
                    //         //     'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                    //             'Content-Type': 'multipart/form-data',
                    //         //      'Access-Control-Allow-Origin':'*',
                    //         // },
                    //         body: formData, // Передаем FormData объект как тело запроса
                    //     });
                    //     if (!response.ok) {
                    //         alert('Failed to upload file');
                    //     }
                    // } catch (error) {
                    //     this.setState({uploadStatus: 'Failed to upload file'});
                    //     console.error('Error:', error);
                    //     alert('Error: ' + error.toString())
                    // }
                    //---------------------------------------------------------------------
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
                }}>Calculate
                </button>
                <br/>
                <input type="button" value="Save" id="saveFile" style={{display: 'none'}} onClick={() => {
                    const jsonString = JSON.stringify(Object.fromEntries(this.getFormData()));

                    // Создаем Blob из строки JSON
                    const blob = new Blob([jsonString], {type: 'application/json'});

                    // Создаем ссылку для скачивания
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'data.json'; // Указываем имя файла для скачивания

                    // Программно вызываем клик по ссылке для скачивания файла
                    link.click();

                    // Освобождаем память, удаляя объект URL после скачивания
                    URL.revokeObjectURL(url);
                }}/>
                <label htmlFor="saveFile">Save</label>
                <br/>

                {/*https://developer.mozilla.org/ru/docs/Web/API/File_API/Using_files_from_web_applications*/}
                <input
                    type="file"
                    id="loadFile"
                    style={{display: 'none'}}
                    // multiple
                    // accept="image/*"
                    onChange={() => {

                    }}
                />
                <label htmlFor="loadFile">Load</label>

            </form>
        )
    }
}