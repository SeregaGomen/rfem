import React from "react";
//import axios from 'axios';

//https://htmlbook.ru/samhtml/tablitsy/obedinenie-yacheek
export class ParamTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            col_type: this.props.col_type,
        };
    }

    addRows(rows) {
        for (let i = 0; i < this.props.data.length; i++) {
            for (let j = 0; j < this.props.data[i].length; j++) {
                if (this.props.direct === "on" && j === this.props.data[i].length - 1) {
                    continue;
                }

                rows.push(<td key={i.toString() + "_" + j.toString()}>
                    <input id={i.toString() + "_" + j.toString()} type={this.state.col_type[j] === "str" ?
                        "text" : "number"} step="any" defaultValue={this.props.data[i][j]}
                           onChange={(event) => {
                               let row_index = Number(event.target.id.substring(0, event.target.id.search("_")));
                               let col_index = Number(event.target.id.substring(event.target.id.search("_") + 1, event.target.id.length));
                               let table = this.state.data;
                               table[row_index][col_index] = event.target.value;
                               this.setState({data: table});
                           }}/>
                </td>);
            }
            if (this.props.direct === "on") {
                let mask = [1, 2, 4]; // X, Y or Z
                for (let j = 0; j < 3; j++) {
                    let value = Number(this.state.data[i][this.state.data[i].length - 1]) & mask[j];
                    rows.push(
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
        }
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
        this.addRows(rows);
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
                <tbody>
                {
                    <tr>{rows}</tr>
                }
                <tr>
                    <td>
                        <input type="button" value="add" onClick={() => {
                            let d = this.state.data;
                            d.push(["", ""]);
                            this.setState({data: d})
                        }}/>
                        <input type="button" value="del" disabled={!this.state.data.length} onClick={() => {
                            let d = this.state.data;
                            d.splice(d.length - 1, 1);
                            this.setState({data: d});
                        }}/>
                    </td>
                </tr>
                </tbody>
            </table>
        );
    }
}

export class FileUploader extends React.Component {
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
                    <legend>Mesh file name</legend>
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
                                try {
                                    // Отправка данных на сервер через fetch
                                    const response = await fetch('http://localhost:8001/upload', {
                                        method: 'POST',
                                        // headers: {
                                        //     'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                                        //     'Content-Type': 'multipart/form-data',
                                        //      'Access-Control-Allow-Origin':'*',
                                        // },
                                        body: formData, // Передаем FormData объект как тело запроса
                                    });

                                    if (response.ok) {
                                        //this.setState({uploadStatus: 'File uploaded successfully'});


                                        let text = await response.text();

                                        //alert(text);
                                        this.setState({uploadStatus: text});


                                        this.props.history.push('/problem');


                                        //useNavigate()('/info', { state: { uploadStratus: text } });



                                        //window.history.pushState({uploadStatus: text}, '', '/problem');
                                        //window.history.forward();
                                        //window.history.go(-1); // https://developer.mozilla.org/en-US/docs/Web/API/History_API
                                        //window.location.assign('/problem');

                                        // response.json().then(function (data) {
                                        //     alert(data)
                                        // });
                                        //alert("Response: " + response.body.toString());
                                        //const json = await response.json();
                                        //alert(JSON.stringify(json));
                                        //const msg = JSON.parse(json).msg;
                                        //console.log(msg);


                                    } else {
                                        this.setState({uploadStatus: 'Failed to upload file'});
                                    }
                                } catch (error) {
                                    this.setState({uploadStatus: 'Failed to upload file'});
                                    console.error('Error:', error);
                                    alert('Error: ' + error.toString())
                                }


                                //---------------------------------------------------------------------


                                // axios.post('http://localhost:8001/upload', formData, {
                                //     headers: {
                                //         'Content-Type': 'multipart/form-data',
                                //         // 'Access-Control-Allow-Origin': '*',
                                //         // 'Access-Control-Allow-Headers': '*',
                                //     },
                                // })
                                // .then(response => {
                                //
                                //
                                //     let text = response.data;
                                //     //
                                //     //         //alert(text);
                                //     this.setState({uploadStatus: text});
                                //
                                //
                                //     //this.setState({uploadStatus: 'File uploaded successfully'});
                                //     //console.log('File uploaded successfully:', response.data);
                                //
                                // })
                                //     .catch(error => {
                                //         this.setState({uploadStatus: 'Failed to upload file'});
                                //         console.error('Failed to upload file:', error);
                                //         alert('Error: ' + error.toString())
                                //     });
                            }} value="Upload" disabled={this.state.file ? null : 'disabled'}/>
                {<p>{this.state.uploadStatus}</p>}
            </form>
        );
    }
}

// https://muhimasri.com/blogs/react-editable-table/



// https://stackoverflow.com/questions/41956465/how-to-create-multiple-page-app-using-react
// https://qna.habr.com/q/621746
// https://reactrouter.com/en/main/start/tutorial
