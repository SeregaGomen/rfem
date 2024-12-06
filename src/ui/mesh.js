import React from "react";
import axios from "axios";
import {Link} from "react-router-dom";

export function MeshForm() {
    const [file, setFile] = React.useState(null);
    const [uploadStatus, setUploadStatus] = React.useState("");
    return (
        <form>
            <h1>Upload Mesh</h1>
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
                    formData.append("file", file);
                    axios.post(window.serverURL + "/upload", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                        .then(response => {
                            setUploadStatus(response.data);
                        })
                        .catch(error => {
                            setUploadStatus("Failed to upload file");
                            //console.error('Failed to upload file:', error);
                            alert("Error: " + error.toString())
                        });
                }} value="Upload" disabled={file ? null : "disabled"}/>
            {<p>{uploadStatus}</p>}
            <br/>
            <Link to="/">Home</Link>
        </form>
    );
}
