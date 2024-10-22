import React, {useEffect} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom"

export function LoadProblemForm() {
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [fileList, setFileList] = React.useState([]);

    useEffect(() => {
        fetch("http://localhost:8001/problem_list")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setFileList(result);
                },
                // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
                // чтобы не перехватывать исключения из ошибок в самих компонентах.
                (error) => {
                    setError(error);
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
                <h1>Open Problem</h1>
                <ProblemList fileList={fileList}/>
            </div>
        );
    }
}

function ProblemList(props) {
    const [fileName, setFileName] = React.useState(null);
    const navigate = useNavigate();
    const openProblem = (data) => {
        navigate('/problem?' + data.Mesh);
    };

    let list = props.fileList.map((file, i) => (<option key={i}>{file}</option>));
    list.splice(0, 0, <option value="" style={{display: 'none'}}></option>);

    return (
        <form>
            <fieldset>
                <legend>Mesh files</legend>
                <label>File name:<br/>
                    <select name="problem_list" size="1" onChange={(event) => {
                        setFileName(event.target.value);
                        }}>
                        {list}
                    </select>
                </label>
            </fieldset>
            <input type="button" onClick=
                {
                    async () => {
                        const formData = new FormData();
                        formData.append('problemName', fileName);
                        axios.post('http://localhost:8001/load_problem', formData/*this.state.fileName*/, {
                            headers: {
                                'Content-Type': 'text/plain',
                            },
                        })
                            .then((response) => {
                                //console.log("Success:", response.data);
                                //alert("Success: " + response.data);
                                openProblem(response.data);
                            })
                            .catch((error) => {
                                //console.error("Error:", error);
                                alert("Error: " + error);
                            });
                    }
                } value="Download" disabled={fileName ? null : 'disabled'}/>
            <br/>
            <Link to="/">Home</Link>
        </form>

    );
}
