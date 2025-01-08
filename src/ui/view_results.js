import React, {useEffect} from "react";
import Modal from "react-modal";
import {renderMesh} from "../draw/draw";
import {degToRad, radToDeg} from "../draw/utils";
import {Link} from "react-router-dom";
import {
    Canvas,
    LoadButton,
    RotateBox,
    ViewBox,
    VisualizationBox,
    TranslationSceneBox,
    ScaleSceneBox,
    TransformationObjectBox, ProgressOverlay
} from "./components";
//import {loadFile} from "../file/file";

export function OpenResultsFileForm() {
    const [mesh, setMesh] = React.useState(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);

    if (!isDialogOpen && !isLoading) {
        return (
            <ViewResultsForm mesh={mesh} isRef={true}/>
        );
    }
    if (isLoading && !isDialogOpen) {
        return (
            <div>
                {/*<h1>Loading file</h1>*/}
                {
                    // <progress/>
                    <ProgressOverlay/>
                }
            </div>);
    }
    let onChange = (event) => {
        if (event.target.files.length === 0) {
            //console.log("File is undefined!");
            return;
        }
        setIsLoading(true);
        setIsDialogOpen(false)

        // loadFile(event.target.files[0]).then((value) => {
        //     setMesh(value.mesh);
        //     setIsLoading(false);
        // }).catch(() => {
        //     alert("Failed to load file!")
        // });

        const worker = new Worker(new URL("../file/file_worker.js", import.meta.url));

        worker.postMessage(event.target.files[0]);
        worker.onmessage = function(event) {
            if (event.data.status === "success") {
                setMesh(event.data.mesh);
            } else {
                setIsDialogOpen(true);
                alert("Failed to load file!");
            }
            setIsLoading(false);
            worker.terminate();
        };

    }

    return (
        <form>
            <Modal isOpen={isDialogOpen} ariaHideApp={false}>
                <h1>Open Results</h1>
                <fieldset>
                    <legend>Saved results files</legend>
                    <label>File name:<br/>
                        <LoadButton onChange={onChange} mask=".qres, .res, .txt"/>
                    </label>
                </fieldset>
            </Modal>
        </form>
    );
}


export function ViewResultsForm(props) {
    const [isLegend, setIsLegend] = React.useState(true);
    const [isAutoRotation, setIsAutoRotation] = React.useState(true);
    const [isAxes, setIsAxes] = React.useState(true);
    const [funIndex, setFunIndex] = React.useState(-1);
    const [numColors, setNumColors] = React.useState(32);
    const [rotation, setRotation] = React.useState([0.0, 0.0, 0.0]);
    const [isMesh, setIsMesh] = React.useState(true);
    const [isSurface, setIsSurface] = React.useState(true);
    const [translate, setTranslate] = React.useState([0.0, 0.0, 0.0]);
    const [scale, setScale] = React.useState(0.0);
    const [transformation, setTransformation] = React.useState({
        index: [0, 1, 2], ratio: 0.0,
    });

    useEffect(() => {
        if (props.mesh) {
            setFunIndex(props.mesh.func.length === 0 ? -1 : 0);
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
            if (props.mesh) {
                renderMesh.setMesh(props.mesh);
            }
        } else {
            renderMesh.setMesh(null);
        }
    }, [props]);
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
        setRotation(value);
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

    return (
        <div className="container" style={{ position: 'sticky', display: 'block'}}>
            <Canvas id={"gl"}/>
            <Canvas id={"text"}/>
            {
                props.mesh ?
                    <div className="parametersBox">
                    {
                        funIndex !== -1 ?
                            <ViewBox funIndex={funIndex} numColors={numColors} isLegend={isLegend}
                                     funList={props.mesh.func} updateFunIndex={updateFunIndex}
                                     updateNumColors={updateNumColors}
                                     updateIsLegend={updateIsLegend}/>
                        : null
                    }
                        <RotateBox rotation={rotation} isAutoRotation={isAutoRotation}
                                   updateRotation={updateRotation} updateIsAutoRotation={updateIsAutoRotation}/>
                        <VisualizationBox mesh={props.mesh} isAxes={isAxes} isMesh={isMesh} isSurface={isSurface}
                                          updateIsAxes={updateIsAxes} updateRadio={updateRadio}/>
                        <TranslationSceneBox translate={translate} updateTranslate={updateTranslate}/>
                        <ScaleSceneBox scale={scale} updateScale={updateScale}/>
                        {
                            funIndex !== -1 ?
                                <TransformationObjectBox funIndex={funIndex} funList={props.mesh.func}
                                                         transformation={transformation} feType={props.mesh.feType}
                                                         updateTransformationIndex={updateTransformationIndex}
                                                         updateTransformationRatio={updateTransformationRatio}/>
                            : null
                        }

                    </div>
                : null
            }
            <br/>
            <br/>
            {
                props.isRef ? <Link to="/">Home</Link> : null
            }
        </div>
    );
}