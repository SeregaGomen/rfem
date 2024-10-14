import React from "react";

export class LoadProblemForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <form>
                <h1>Open Problem</h1>
                <ProblemList />
            </form>
        )
    }
}

class ProblemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            files: []
        };
    }

    componentDidMount() {
        fetch("http://localhost:8001/problem_list")
            .then(res => res.json())
            .then(
                (result) => {

                    alert(result);

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
            return <div>Ошибка: {this.state.error.message}</div>;
        } else if (!this.state.isLoaded) {
            return <div>Загрузка...</div>;
        } else {
            return (
                <ul>
                    {this.state.files.map(file => (
                        <li>
                            {file}
                        </li>
                    ))}
                </ul>
            );
        }
    }
}