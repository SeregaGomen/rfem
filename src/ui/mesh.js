import React from "react";
import axios from "axios";
import {Link} from "react-router-dom";

export function MeshForm() {
    return (
        <div>
            <h1>Upload Mesh</h1>
            <FileUploader />
        </div>
    );
}

function FileUploader() {
    const [file, setFile] = React.useState(null);
    const [uploadStatus, setUploadStatus] = React.useState("");

    return (
        <form>
            <fieldset>
                <legend>Mesh files</legend>
                <label>File name:<br/>
                    <input type="file" onChange={(event) => {
                        setFile(event.target.files[0]);
                        setUploadStatus("");
                    }}/><br/>
                </label>
            </fieldset>
            <input type="button" onClick=
                {async () => {
                    if (!file) {
                        alert("Please select a file first!");
                        return;
                    }

                    // Создаем объект FormData и добавляем файл
                    const formData = new FormData();
                    formData.append('file', file);
                    axios.post('http://localhost:8001/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            // 'Access-Control-Allow-Origin': '*',
                            // 'Access-Control-Allow-Headers': '*',
                        },
                    })
                        .then(response => {
                            setUploadStatus(response.data);
                        })
                        .catch(error => {
                            setUploadStatus("Failed to upload file");
                            console.error('Failed to upload file:', error);
                            // alert('Error: ' + error.toString())
                        });
                }} value="Upload" disabled={file ? null : "disabled"}/>
            {<p>{uploadStatus}</p>}
            <br/>
            <Link to="/">Home</Link>
        </form>
    );
}

