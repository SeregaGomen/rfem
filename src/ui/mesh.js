import React from "react";
import {FileUploader} from "./primitives";

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