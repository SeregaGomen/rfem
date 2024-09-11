import React from "react";
import {Ref} from "./primitives";


export class MainForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <form>
                <h1>Finite Element Method</h1>
                <Ref href="#mesh" title="Upload Mesh" />
                <Ref href="#problem" title="New Problem" />
                <Ref href="#load" title="Open Problem" />
            </form>
        )
    }
}

// https://qna.habr.com/q/621746
// https://qna.habr.com/q/537748
// https://ui.dev/react-router-protected-routes-authentication
