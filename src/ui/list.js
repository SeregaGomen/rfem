import React from "react";
import axios from "axios";

export class LoadProblemForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                <h1>Open Problem</h1>
                <ProblemList />
            </div>
        )
    }
}

class ProblemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            files: [],
            index: null
        };
    }

    componentDidMount() {
        fetch("http://localhost:8001/problem_list")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        files: result
                    });
                },
                // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
                // чтобы не перехватывать исключения из ошибок в самих компонентах.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() {
        //const { error, isLoaded, items } = this.state;
        if (this.state.error) {
            return <div>Error: {this.state.error.message}</div>;
        } else if (!this.state.isLoaded) {
            return <div>Downloading...</div>;
        } else {
            return (
                <form>
                    <fieldset>
                        <legend>Mesh files</legend>
                        <label>File name:<br/>
                            <select name="problem_list" size="1">
                                {
                                    this.state.files.map((file, i) => (
                                        <option key={i}>
                                            {file}
                                        </option>
                                    ))
                                }
                            </select>
                        </label>
                    </fieldset>
                    <input type="button" onClick=
                        {async () => {
                        }} value="Download" disabled={this.state.index ? null : 'disabled'}/>
                </form>
            );
        }
    }
}