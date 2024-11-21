import React from "react";
import { renderMesh } from "../draw/draw";
import { degToRad, radToDeg } from "../draw/utils";
import {
    Canvas,
    LoadButton,
    RotateBox,
    ViewBox,
    VisualizationBox,
    TranslationSceneBox,
    ScaleSceneBox,
    TransformationObjectBox
} from "./components";
import Modal from "react-modal";
import {Link} from "react-router-dom";

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
    const [isDialogOpen, setIsDialogOpen] = React.useState(true);

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
        setIsDialogOpen(false)
        // if (value.mesh) {
        //     renderMesh.setMesh(value.mesh);
        // }
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
            setIsSurface(false);
            renderMesh.setIsMesh(true);
            renderMesh.setIsSurface(false);
        } else {
            setIsMesh(false);
            setIsSurface(true);
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

    // if (isDialogOpen) {
    //     return (
    //         <Modal isOpen={isDialogOpen} ariaHideApp={false}>
    //             <LoadButton updateData={updateFile} clear={clear}/>
    //
    //         </Modal>
    //     );
    // }

    return (
        <form>
            {/*<LoadButton updateData={updateFile} clear={clear}/>*/}
            {!isDialogOpen ?
                <div className="container">
                    <Canvas id={"gl"} updateData={() => {
                        renderMesh.setMesh(mesh);
                    }}/>
                    <Canvas id={"text"} updateData={() => {
                    }}/>
                    <div className="parametersBox">
                        <ViewBox funIndex={funIndex} numColors={numColors}
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
                    <br/>
                    <br/>
                    <Link to="/">Home</Link>
                </div> : null
            }
            <Modal isOpen={isDialogOpen} ariaHideApp={false} >
                <h1>Open Results</h1>
                <fieldset>
                    <legend>Saved results files</legend>
                    <label>File name:<br/>
                        <LoadButton updateData={updateFile} clear={clear}/>
                    </label>
                </fieldset>
            </Modal>
        </form>
    );
}