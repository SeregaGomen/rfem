import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {ProblemForm} from "./problem";

export class LoadProblemForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            files: [],
        };
    }

    componentDidMount() {
        fetch("http://localhost:8001/problem_list")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({isLoaded: true, files: result});
                },
                // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
                // чтобы не перехватывать исключения из ошибок в самих компонентах.
                (error) => {
                    this.setState({isLoaded: true, error});
                }
            )
    }

    render() {
        if (this.state.error) {
            return <div>Error: {this.state.error.message}</div>;
        } else if (!this.state.isLoaded) {
            return <div>Downloading...</div>;
        } else {
            return (
                <div>
                    <ProblemList fileList={this.state.files}/>
                </div>
            );
        }
    }
}

class ProblemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: this.props.fileList,
            fileName: null,
            shouldRedirect: false,
            problemData: null,
        };
    }

    render() {
        let list = this.state.fileList.map((file, i) => (<option key={i}>{file}</option>));
        list.splice(0, 0, <option value="" style={{display: 'none'}}></option>);

        if (this.state.shouldRedirect) {
            const mesh = this.state.problemData.Mesh;
            const numThread = this.state.problemData.NumThread;
            const eps = this.state.problemData.Eps;
            const variables = this.state.problemData.Variables;
            const youngModulus =[];
            const poissonRatio =[];
            const thickness =[];
            const volumeLoad =[];
            const pointLoad =[];
            const surfaceLoad =[];
            const pressureLoad =[];
            const boundaryCondition =[];

            // for (const variable of this.state.problemData.Variables) {
            //     variables.push([variable.Name, variable.Value]);
            // }

            for (const param of this.state.problemData.Params) {
                switch (param.Type) {
                    case 0: // Boundary Condition
                        boundaryCondition.push([param.Value, param.Predicate, param.Direct.toString()]);
                        break;
                    case 1: // Volume Load
                        volumeLoad.push([param.Value, param.Predicate, param.Direct.toString()]);
                        break;
                    case 2: // Surface Load
                        surfaceLoad.push([param.Value, param.Predicate, param.Direct.toString()]);
                        break;
                    case 3: // Point Load
                        pointLoad.push([param.Value, param.Predicate, param.Direct.toString()]);
                        break;
                    case 4: // Pressure Load
                        pressureLoad.push([param.Value, param.Predicate]);
                        break;
                    case 5: // Thickness
                        thickness.push([param.Value, param.Predicate]);
                        break;
                    case 6: // Yong Modulus
                        youngModulus.push([param.Value, param.Predicate]);
                        break;
                    case 7: // Poisson's Ratio
                        poissonRatio.push([param.Value, param.Predicate]);
                        break;
                    default:
                        break;
                }
            }
            return <ProblemForm mesh={mesh} numThread={numThread} eps={eps} variables={variables}
                                youngModulus={youngModulus} poissonRatio={poissonRatio}
                                thickness={thickness} volumeLoad={volumeLoad} pointLoad={pointLoad}
                                surfaceLoad={surfaceLoad} pressureLoad={pressureLoad}
                                boundaryCondition={boundaryCondition}/>
        }

        return (
            <form>
                <h1>Open Problem</h1>
                <fieldset>
                    <legend>Mesh files</legend>
                    <label>File name:<br/>
                        <select name="problem_list" size="1" onChange={(event) => {
                            this.setState({fileName: event.target.value});
                            //alert(event.target.value);
                        }}>{list}
                        </select>
                    </label>
                </fieldset>
                <input type="button" onClick=
                    {
                        async () => {
                            const formData = new FormData();
                            formData.append('problemName', this.state.fileName);
                            axios.post('http://localhost:8001/load_problem', formData/*this.state.fileName*/, {
                                headers: {
                                    'Content-Type': 'text/plain',
                                },
                            })
                                .then((response) => {
                                    // console.log("Success:", response.data);
                                    //let data = response.data;
                                    //alert(data.Mesh);

                                    //this.props.history.push("/problem");
                                    //this.props.navigate('/problem');

                                    this.setState({shouldRedirect: true});
                                    this.setState({problemData: response.data});
                                })
                                .catch((error) => {
                                    //console.error("Error:", error);
                                    alert("Error: " + error);
                                });
                        }
                    } value="Download" disabled={this.state.fileName ? null : 'disabled'}/>
                <br/>
                <Link to="/">Home</Link>
            </form>
        );
    }
}

