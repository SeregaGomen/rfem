import React from "react";
import axios from "axios";
import {Link} from "react-router-dom";

export class MeshForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                <h1>Upload Mesh</h1>
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

                        //---------------------------------------------------------------------
                        // try {
                        //     // Отправка данных на сервер через fetch
                        //     const response = await fetch('http://localhost:8001/upload', {
                        //         method: 'POST',
                        //         // headers: {
                        //         //     'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                        //         //     'Content-Type': 'multipart/form-data',
                        //         //      'Access-Control-Allow-Origin':'*',
                        //         // },
                        //         body: formData, // Передаем FormData объект как тело запроса
                        //     });
                        //
                        //     if (response.ok) {
                        //         //this.setState({uploadStatus: 'File uploaded successfully'});
                        //
                        //
                        //         let text = await response.text();
                        //
                        //         //alert(text);
                        //         this.setState({uploadStatus: text});
                        //
                        //
                        //         this.props.history.push('/problem');
                        //
                        //
                        //         //useNavigate()('/info', { state: { uploadStratus: text } });
                        //
                        //
                        //
                        //         //window.history.pushState({uploadStatus: text}, '', '/problem');
                        //         //window.history.forward();
                        //         //window.history.go(-1); // https://developer.mozilla.org/en-US/docs/Web/API/History_API
                        //         //window.location.assign('/problem');
                        //
                        //         // response.json().then(function (data) {
                        //         //     alert(data)
                        //         // });
                        //         //alert("Response: " + response.body.toString());
                        //         //const json = await response.json();
                        //         //alert(JSON.stringify(json));
                        //         //const msg = JSON.parse(json).msg;
                        //         //console.log(msg);
                        //
                        //
                        //     } else {
                        //         this.setState({uploadStatus: 'Failed to upload file'});
                        //     }
                        // } catch (error) {
                        //     this.setState({uploadStatus: 'Failed to upload file'});
                        //     console.error('Error:', error);
                        //     alert('Error: ' + error.toString())
                        // }


                        //---------------------------------------------------------------------


                        axios.post('http://localhost:8001/upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                // 'Access-Control-Allow-Origin': '*',
                                // 'Access-Control-Allow-Headers': '*',
                            },
                        })
                            .then(response => {


                                let text = response.data;
                                //
                                //         //alert(text);
                                this.setState({uploadStatus: text});


                                //this.setState({uploadStatus: 'File uploaded successfully'});
                                //console.log('File uploaded successfully:', response.data);

                            })
                            .catch(error => {
                                this.setState({uploadStatus: 'Failed to upload file'});
                                console.error('Failed to upload file:', error);
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

// https://muhimasri.com/blogs/react-editable-table/



// https://stackoverflow.com/questions/41956465/how-to-create-multiple-page-app-using-react
// https://qna.habr.com/q/621746
// https://reactrouter.com/en/main/start/tutorial


