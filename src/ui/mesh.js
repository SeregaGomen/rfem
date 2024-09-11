import React from "react";
import {Ref, FileUploader} from "./primitives";

export class MeshForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <form>
                <h1>Upload Mesh</h1>
                <FileUploader />
                <Ref href="#" title="home" />
            </form>
        )
    }
}