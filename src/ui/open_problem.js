import React, {useEffect} from "react";
import axios from "axios";
import Modal from "react-modal";
import { ProblemForm } from "./problem";
import { useNavigate } from 'react-router-dom';

export function LoadProblemForm() {
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [files, setFiles] = React.useState([]);
    useEffect(() => {
        fetch("http://localhost:8001/problem_list")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setFiles(result);
                },
                (error) => {
                    setError(error);
                    setIsLoaded(true);
                }
            )
    }, []);
    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Downloading...</div>;
    } else {
        return (
            <div>
                <ProblemList fileList={files}/>
            </div>
        );
    }
}

function ProblemList(props)  {
    const [fileName, setFileName] = React.useState(null);
    const [shouldRedirect, setShouldRedirect] = React.useState(false);
    const [problemData, setProblemData] = React.useState(null);
    const [isDialogOpen] = React.useState(true);
    const list = props.fileList.map((file, i) => (<option key={i}>{file}</option>));
    const navigate = useNavigate();

    list.splice(0, 0, <option value="" style={{display: 'none'}}></option>);
    if (shouldRedirect) {
        const mesh = problemData.Mesh;
        const numThread = problemData.NumThread;
        const eps = problemData.Eps;
        const variables = [];
        const youngModulus = [];
        const poissonRatio = [];
        const thickness = [];
        const volumeLoad = [];
        const pointLoad = [];
        const surfaceLoad = [];
        const pressureLoad = [];
        const boundaryCondition = [];

        for (const variable of problemData.Variables) {
            variables.push(variable);
        }

        for (const param of problemData.Params) {
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
        return <ProblemForm data = {{ Mesh: mesh, NumThread: numThread, Eps: eps, Variables: variables,
            YoungModulus: youngModulus, PoissonRatio: poissonRatio, Thickness: thickness, VolumeLoad: volumeLoad,
            PointLoad: pointLoad, SurfaceLoad: surfaceLoad, PressureLoad: pressureLoad,
            BoundaryCondition: boundaryCondition }}/>
    }
    return (
        <Modal isOpen={isDialogOpen}>
            <h1>Open Problem</h1>
            <fieldset>
                <legend>Saved problem files</legend>
                <label>File name:<br/>
                    <select name="problem_list" size="1" onChange={(event) => {
                        setFileName(event.target.value);
                        //alert(event.target.value);
                    }}>{list}
                    </select>
                </label>
            </fieldset>
            <input type="button" onClick=
                {
                    async () => {
                        const formData = new FormData();
                        formData.append('problemName', fileName);
                        axios.post('http://localhost:8001/load_problem', formData, {
                            headers: {
                                'Content-Type': 'text/plain',
                            },
                        })
                            .then((response) => {
                                setShouldRedirect(true);
                                setProblemData(response.data);
                            })
                            .catch((error) => {
                                alert("Error: " + error);
                            });
                    }
                } value="Ok" disabled={fileName ? null : 'disabled'}/>

            <input type="button" onClick={()=>{
                navigate("/");
            }} value="Cancel" />
        </Modal>
    );
}