import React from "react";
import {ProblemList} from "./primitives";

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