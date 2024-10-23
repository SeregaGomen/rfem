import React from "react";
import { Link } from 'react-router-dom';


export class MainForm extends React.Component {
    render() {
        return (
            <div>
                <h1>Finite Element Method</h1>
                    <nav>
                        <ul>
                            {/*<li><Link to='/'>Home</Link></li>*/}
                            <li><Link to='/mesh'>Upload Mesh</Link></li>
                            <li><Link to='/problem'>New Problem</Link></li>
                            <li><Link to='/list'>Load Problem</Link></li>
                        </ul>
                    </nav>
            </div>
        )
    }
}
