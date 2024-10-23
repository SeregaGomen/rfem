import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export class MeshForm extends React.Component {
    render() {
        return (
            <div>
                <FileUploader />
            </div>
        )
    }
}

class FileUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            uploadStatus: "",
        };
    }
    render() {
        return (
            <form>
                <h1>Upload Mesh</h1>
                <fieldset>
                    <legend>Mesh files</legend>
                    <label>File name:<br/>
                        <input type="file" onChange={(event) => {
                            this.setState({file: event.target.files[0]});
                            this.setState({uploadStatus: ""});
                        }}/><br/>
                    </label>
                </fieldset>
                <input type="button" onClick=
                    {async () => {
                        if (!this.state.file) {
                            alert("Please select a file first!");
                            return;
                        }
                        // Создаем объект FormData и добавляем файл
                        const formData = new FormData();
                        formData.append('file', this.state.file);
                        axios.post('http://localhost:8001/upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                // 'Access-Control-Allow-Origin': '*',
                                // 'Access-Control-Allow-Headers': '*',
                            },
                        })
                            .then(response => {
                                this.setState({uploadStatus: response.data});
                            })
                            .catch(error => {
                                this.setState({uploadStatus: 'Failed to upload file'});
                                //console.error('Failed to upload file:', error);
                                alert('Error: ' + error.toString())
                            });
                    }} value="Upload" disabled={this.state.file ? null : 'disabled'}/>
                {<p>{this.state.uploadStatus}</p>}
                <br/>
                <Link to="/">Home</Link>
            </form>
        );
    }
}
