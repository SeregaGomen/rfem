import React from "react";
import { renderMesh } from '../draw/draw';
import { degToRad, radToDeg } from '../draw/utils';
import { loadFile } from "../file/file";

class RadioBox extends React.Component {
    render() {
        return (
            <label>
                <input type="radio"
                       value={this.props.value}
                       name={this.props.name}
                       checked={this.props.checked}
                       onChange={(event) => {
                           this.props.updateData(event.target.value);
                       }}
                />
                {this.props.value}
            </label>
        );
    }
}

class CheckBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: this.props.isChecked,
        };
    }

    render() {
        return (
            <label>
                <input type="checkbox"
                       checked={this.props.isChecked}
                       onChange={() => {
                           this.setState({isChecked: !this.state.isChecked});
                           this.props.updateData(!this.state.isChecked);
                       }}
                />
                {this.props.caption}
            </label>
        );
    }
}

class ListBox extends React.Component {
    render() {
        return (
            <label><span style={{width: this.props.width, float: "left"}}>{this.props.label}</span>
                <select
                    name={this.props.name}
                    size={1}
                    value={this.props.value}
                    onChange={this.props.updateData}>
                    {
                        this.props.mesh ? this.props.mesh.func.map((v, i) => (
                            <option key={i} value={i} selected={i===this.props.index}>{v.name}</option>
                        )) : null
                    }
                </select>
            </label>
        );
    }
}


class Slider extends React.Component {
    render() {
        return (
            <div>
                <label><span style={{width: this.props.width, float: "left"}}>{this.props.caption}</span>
                    <input type="range"
                           min={this.props.min}
                           max={this.props.max}
                           step={this.props.step}
                           value={this.props.value}
                           onChange={(event) => {
                               this.props.updateData(Number(event.target.value));
                           }}
                    />
                    <span style={{display: "inline", border: "1px solid gray"}}>{this.props.value}</span>
                </label>
            </div>
        );
    }
}


class Canvas extends React.Component {
    render() {
        return (
            <canvas className="canvasBox" id={this.props.id}>
                Please use a browser that supports "canvas"
            </canvas>
        )
    }
}

class LoadButton extends React.Component {
    updateFile = (value) => {
        this.props.updateData(value);
    }
    render() {
        return (
            <input type="file"
                   accept=".mesh, .msh, .vol, .qres, .res, .txt"
                   onChange={(event) => {
                       if (event.target.files.length === 0) {
                           //console.log("File is undefined!");
                           return;
                       }
                       this.props.clear();
                       loadFile(event.target.files[0]).then(this.updateFile).catch(() => {
                           alert("Failed to load file!")
                       });
                   }}
            />
        )
    }
}

class RotateBox extends React.Component {
    render() {
        return (
            this.props.mesh ?
                <fieldset className="rotationBox">
                    <legend>Rotation</legend>
                    <CheckBox isChecked={this.props.isAutoRotation} caption={"Auto-rotation"}
                              updateData={this.props.updateIsAutoRotation}/>
                    {
                        !this.props.isAutoRotation ?
                            <Slider min={0} max={360} step={1} value={this.props.rotation[0]} caption={"X:"}
                                    width={"20px"}
                                    updateData={(val) => {
                                        this.props.updateRotation([val, this.props.rotation[1], this.props.rotation[2]])
                                    }}
                            />
                            : null
                    }
                    {
                        !this.props.isAutoRotation ?
                            <Slider min={0} max={360} step={1} value={this.props.rotation[1]} caption={"Y:"}
                                    width={"20px"}
                                    updateData={(val) => {
                                        this.props.updateRotation([this.props.rotation[0], val, this.props.rotation[2]])
                                    }}
                            />
                            : null
                    }
                    {
                        !this.props.isAutoRotation ?
                            <Slider min={0} max={360} step={1} value={this.props.rotation[2]} caption={"Z:"}
                                    width={"20px"}
                                    updateData={(val) => {
                                        this.props.updateRotation([this.props.rotation[0], this.props.rotation[1], val])
                                    }}
                            />
                            : null
                    }
                </fieldset>
                : null
        )
    }
}

class ResultBox extends React.Component {
    updateFunction = (event) => {
        this.props.updateFunIndex({funIndex: Number(event.target.value)});
    }
    updateCheckbox = (event) => {
        this.props.updateIsLegend({isLegend: event});
    }
    updateNumColors = (event) => {
        this.props.updateNumColors({numColors: Number(event)});
    }
    render() {
        return (
            this.props.mesh && this.props.mesh.func.length ?
                <fieldset className="resultBox">
                    <legend>Result</legend>
                    <ListBox name={"Function"} label={"Function:"} mesh={this.props.mesh} index={0} width={"70px"}
                             value={this.props.funIndex} updateData={this.updateFunction}/>
                    <Slider min={32} max={256} step={32} value={this.props.numColors} enabled={true} caption={"Colors:"}
                            updateData={this.updateNumColors}/>
                    <CheckBox isChecked={this.props.isLegend} caption={"Legend"} updateData={this.updateCheckbox}/>
                </fieldset>
                : null
        )
    }
}

class VisualizationBox extends React.Component {
    updateRadio = (event) => {
        if (event === "Mesh and surface") {
            this.props.updateRadio(0);
        } else if (event === "Mesh") {
            this.props.updateRadio(1);
        } else {
            this.props.updateRadio(2);
        }
    }
    render() {
        return (
            this.props.mesh ?
                <fieldset className="visualizationBox">
                    <legend>Visualization</legend>
                    <RadioBox name={"ViewOption"} value={"Mesh and surface"}
                              checked={this.props.isSurface && this.props.isMesh}
                              updateData={this.updateRadio}/>
                    <RadioBox name={"ViewOption"} value={"Mesh"} checked={!this.props.isSurface && this.props.isMesh}
                              updateData={this.updateRadio}/>
                    <RadioBox name={"ViewOption"} value={"Surface"} checked={this.props.isSurface && !this.props.isMesh}
                              updateData={this.updateRadio}/>
                    <CheckBox isChecked={this.props.isAxes} caption={"Coordinate axes"}
                              updateData={this.props.updateIsAxes}/>
                </fieldset>
                : null
        )
    }
}

class TranslationSceneBox extends React.Component {
    updateTranslateX = (event) => {
        this.props.updateTranslate([Number(event), this.props.translate[1], this.props.translate[2]])
    }
    updateTranslateY = (event) => {
        this.props.updateTranslate([this.props.translate[0], Number(event), this.props.translate[2]])
    }
    render() {
        return (
            this.props.mesh ?
                <fieldset className="TranslationSceneBox">
                    <legend>Translation scene</legend>
                    <Slider min={-1.00} max={1.00} step={0.25} value={this.props.translate[0]} enabled={true}
                            caption={"X:"} width={"20px"}
                            updateData={this.updateTranslateX}/>
                    <Slider min={-1.00} max={1.00} step={0.25} value={this.props.translate[1]} enabled={true}
                            caption={"Y:"} width={"20px"}
                            updateData={this.updateTranslateY}/>
                </fieldset>
                : null
        )
    }
}

class ScaleSceneBox extends React.Component {
    render() {
        return (
            this.props.mesh ?
                <fieldset className="scaleSceneBox">
                    <legend>Scale scene</legend>
                    <Slider min={0.5} max={5.0} step={0.5} value={this.props.scale} enabled={true} caption={"Ratio:"}
                            updateData={this.props.updateScale}/>
                </fieldset>
                : null
        )
    }
}

class TransformationObjectBox extends React.Component {
    updateTransformationX = (event) => {
        this.props.updateTransformationIndex([Number(event.target.value), this.props.transformation.index[1],
            this.props.transformation.index[2]])
    }
    updateTransformationY = (event) => {
        this.props.updateTransformationIndex([this.props.transformation.index[0], Number(event.target.value),
            this.props.transformation.index[2]])
    }
    updateTransformationZ = (event) => {
        this.props.updateTransformationIndex([this.props.transformation.index[0], this.props.transformation.index[1],
            Number(event.target.value)])
    }
    updateTransformationRatio = (event) => {
        this.props.updateTransformationRatio(event)
    }
    render() {
        return (
            this.props.mesh && this.props.mesh.func.length ?
                <fieldset className="transformationObjectBox">
                    <legend>Transformation object</legend>
                    <ListBox name={"Function"} label={"X:"} mesh={this.props.mesh} index={0} width={"20px"}
                             value={this.props.transformation.index[0]} updateData={this.updateTransformationX}/>
                    <ListBox name={"Function"} label={"Y:"} mesh={this.props.mesh} index={1} width={"20px"}
                             value={this.props.transformation.index[1]} updateData={this.updateTransformationY}/>
                    {
                        this.props.mesh.feType.indexOf("fe2d") === -1 ?
                            <ListBox name={"Function"} label={"Z:"} mesh={this.props.mesh} index={2} width={"20px"}
                                     value={this.props.transformation.index[2]} updateData={this.updateTransformationZ}/>
                            : null
                    }
                    <Slider min={0} max={0.5} step={0.1} value={this.props.transformation.ratio} enabled={true}
                            caption={"Ratio:"} updateData={this.updateTransformationRatio}/>
                </fieldset>
                : null
        )
    }
}


export function ViewResultsForm() {
    const [mesh, setMesh] = React.useState(null);
    const [isLegend, setIsLegend] = React.useState(true);
    const [isAutoRotation, setIsAutoRotation] = React.useState(true);
    const [isAxes, setIsAxes] = React.useState(true);
    const [funIndex, setFunIndex] = React.useState(0);
    const [numColors, setNumColors] = React.useState(32);
    const [rotation, setRotation] = React.useState([0.0, 0.0, 0.0]);
    const [isMesh, setIsMesh] = React.useState(true);
    const [isSurface, setIsSurface] = React.useState(true);
    const [translate, setTranslate] = React.useState([0.0, 0.0, 0.0]);
    const [scale, setScale] = React.useState(0.0);
    const [transformation, setTransformation] = React.useState({
        index: [0, 1, 2], ratio: 0.0,
    });

    let clear = () => {
        setMesh(null);
        renderMesh.setMesh(null);
    }
    let updateFile = (value) => {
        setMesh(value.mesh);
        setFunIndex(0);
        setIsLegend(true);
        setIsAutoRotation(true);
        setIsAxes(true);
        setNumColors(32);
        setRotation([0.0, 0.0, 0.0]);
        setTranslate([0.0, 0.0, 0.0]);
        setScale(1.0);
        setIsMesh(true);
        setIsSurface(true);
        setTransformation({index: [0, 1, 2], ratio: 0.0});
        if (value.mesh) {
            renderMesh.setMesh(value.mesh);
        }
    }
    let updateFunIndex = (value) => {
        setFunIndex(value.funIndex);
        renderMesh.setFunIndex(value.funIndex);
    }
    let updateNumColors = (value) => {
        setNumColors(value.numColors);
        renderMesh.setNumColors(value.numColors);
    }
    let updateIsLegend = (value) => {
        setIsLegend(value.isLegend);
        renderMesh.setIsLegend(value.isLegend);
    }
    let updateRotation = (value) => {
        setIsLegend(value);
        renderMesh.setRotation([degToRad(value[0]), degToRad(value[1]), degToRad(value[2])]);
    }
    let updateIsAutoRotation = (value) => {
        setIsAutoRotation(value);
        if (value === false) {
            setRotation([
                    Math.round(radToDeg(renderMesh.getRotation()[0])) % 360,
                    Math.round(radToDeg(renderMesh.getRotation()[1])) % 360,
                    Math.round(radToDeg(renderMesh.getRotation()[2])) % 360,
                ]);
        }
        renderMesh.setIsAutoRotation(value);
    }
    let updateIsAxes = (value) => {
        setIsAxes(value);
        renderMesh.setIsAxes(value);
    }
    let updateRadio = (value) => {
        if (value === 0) {
            setIsMesh(true);
            setIsSurface(true);
            renderMesh.setIsMesh(true);
            renderMesh.setIsSurface(true);
        } else if (value === 1) {
            setIsMesh(true);
            renderMesh.setIsSurface(false);
            renderMesh.setIsMesh(true);
            renderMesh.setIsSurface(false);
        } else {
            setIsMesh(false);
            renderMesh.setIsMesh(true);
            renderMesh.setIsMesh(false);
            renderMesh.setIsSurface(true);
        }
    }
    let updateScale = (value) => {
        setScale(value);
        renderMesh.setScale(value);
    }
    let updateTranslate = (value) => {
        setTranslate(value);
        renderMesh.setTranslate(value);
    }
    let updateTransformationIndex = (value) => {
        setTransformation({index: value, ratio: transformation.ratio});
        renderMesh.setTransformationIndex(value);
    }
    let updateTransformationRatio = (value) => {
        setTransformation({index: transformation.index, ratio: value});
        renderMesh.setTransformationRatio(value);
    }

    return (
        <form>
            <LoadButton updateData={updateFile} clear={clear}/>
            <div className="container">
                <Canvas id={"gl"}/>
                <Canvas id={"text"}/>
                <div className="parametersBox">
                    <ResultBox funIndex={funIndex} numColors={numColors}
                               isLegend={isLegend} mesh={mesh}
                               updateFunIndex={updateFunIndex} updateNumColors={updateNumColors}
                               updateIsLegend={updateIsLegend}/>
                    <RotateBox rotation={rotation} isAutoRotation={isAutoRotation}
                               updateRotation={updateRotation} updateIsAutoRotation={updateIsAutoRotation}
                               mesh={mesh}/>
                    <VisualizationBox mesh={mesh} isAxes={isAxes} isMesh={isMesh}
                                      isSurface={isSurface} updateIsAxes={updateIsAxes}
                                      updateRadio={updateRadio}/>
                    <TranslationSceneBox mesh={mesh} translate={translate}
                                         updateTranslate={updateTranslate}/>
                    <ScaleSceneBox mesh={mesh} scale={scale} updateScale={updateScale}/>
                    <TransformationObjectBox funIndex={funIndex} mesh={mesh}
                                             transformation={transformation}
                                             updateTransformationIndex={updateTransformationIndex}
                                             updateTransformationRatio={updateTransformationRatio}/>
                </div>
            </div>
        </form>
    );
}