import React from "react";
import { Link } from 'react-router-dom';


export class MainForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                <h1>Finite Element Method</h1>
                    <nav>
                        <ul>
                            <li><Link to='/'>Home</Link></li>
                            <li><Link to='/mesh'>Upload Mesh</Link></li>
                            <li><Link to='/problem'>New Problem</Link></li>
                            <li><Link to='/list'>Load Problem</Link></li>
                        </ul>
                    </nav>
            </div>
        )
    }
}

// https://qna.habr.com/q/621746
// https://qna.habr.com/q/537748
// https://ui.dev/react-router-protected-routes-authentication
