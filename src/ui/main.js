import React from "react";
import { Link } from 'react-router-dom';

export function MainForm() {
    return (
        <div>
            <h1>Finite Element Method</h1>
            <nav>
                <ul>
                    {/*<li><Link to='/'>Home</Link></li>*/}
                    {/*<li><Link to='/mesh'>Upload Mesh</Link></li>*/}
                    <li><Link to='/new-problem'>New Problem</Link></li>
                    <li><Link to='/open-problem'>Open Problem</Link></li>
                    <li><Link to='/view-results'>View Results</Link></li>
                </ul>
            </nav>
        </div>
    );
}
