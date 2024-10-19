import React from "react";
import axios from "axios";

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
                <h1>Open Problem</h1>
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
            fileName: null
        };
    }


    render() {
        let list = [<option value="" style={{display: 'none'}}></option>];
        for (let i = 0; i < this.state.fileList.length; i++) {
            list.push(<option key={i}>{this.state.fileList[i]}</option>);
        }
        return (
            <form>
                <fieldset>
                    <legend>Mesh files</legend>
                    <label>File name:<br/>
                        <select name="problem_list" size="1" onChange={(event) => {
                            this.setState({fileName: event.target.value});
                            //alert(event.target.value);
                        }}>
                            {
                                // this.state.fileList.map((file, i) => (<option key={i}>{file}</option>))
                                list
                            }
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
                                    //console.log("Success:", response.data);
                                    //alert("Success: " + response.data);
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                    alert("Error: " + error);
                                });
                         }


                    } value="Download" disabled={this.state.fileName ? null : 'disabled'}/>
            </form>
        );
    }
}