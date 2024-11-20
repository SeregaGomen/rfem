import React, {useEffect} from "react";
import { loadFile } from "../file/file";

export function RadioButton(props) {
    return (
        <label>
            <input type="radio"
                   value={props.value}
                   name={props.name}
                   checked={props.checked}
                   onChange={(event) => {
                       props.updateData(event.target.value);
                   }}
            />
            {props.value}
        </label>
    );
}

export function CheckBox(props) {
    const [isChecked, setIsChecked] = React.useState(props.isChecked);
    return (
        <label>
            <input type="checkbox"
                   checked={props.isChecked}
                   onChange={() => {
                       setIsChecked(!isChecked);
                       props.updateData(!isChecked);
                   }}
            />
            {props.caption}
        </label>
    );
}

export function ListBox(props) {
    return (
        <label><span style={{width: props.width, float: "left"}}>{props.label}</span>
            <select
                name={props.name}
                size={1}
                value={props.value}
                onChange={props.updateData}>
                {
                    props.mesh ? props.mesh.func.map((v, i) => (
                        <option key={i} value={i} selected={i===props.index}>{v.name}</option>
                    )) : null
                }
            </select>
        </label>
    );
}

export function Slider(props) {
    return (
        <div>
            <label><span style={{width: props.width, float: "left"}}>{props.caption}</span>
                <input type="range"
                       min={props.min}
                       max={props.max}
                       step={props.step}
                       value={props.value}
                       onChange={(event) => {
                           props.updateData(Number(event.target.value));
                       }}
                />
                <span style={{display: "inline", border: "1px solid gray"}}>{props.value}</span>
            </label>
        </div>
    );
}

export function Canvas(props) {
    useEffect(() => { props.updateData() }, [props]);
    return (
        <canvas className="canvasBox" id={props.id}>
            Please use a browser that supports "canvas"
        </canvas>
    )
}

export function LoadButton(props) {
    let updateFile = (value) => {
        props.updateData(value);
    }
    return (
        <input type="file"
               accept=".mesh, .msh, .vol, .qres, .res, .txt"
               onChange={(event) => {
                   if (event.target.files.length === 0) {
                       //console.log("File is undefined!");
                       return;
                   }
                   props.clear();
                   loadFile(event.target.files[0]).then(updateFile).catch(() => {
                       alert("Failed to load file!")
                   });
               }}
        />
    )
}

export function RotateBox(props){
    return (
        props.mesh ?
            <fieldset className="rotationBox">
                <legend>Rotation</legend>
                <CheckBox isChecked={props.isAutoRotation} caption={"Auto-rotation"}
                          updateData={props.updateIsAutoRotation}/>
                {
                    !props.isAutoRotation ?
                        <Slider min={0} max={360} step={1} value={props.rotation[0]} caption={"X:"}
                                width={"20px"} updateData={(val) => {
                                    props.updateRotation([val, props.rotation[1], props.rotation[2]])
                                }}
                        />
                    : null
                }
                {
                    !props.isAutoRotation ?
                        <Slider min={0} max={360} step={1} value={props.rotation[1]} caption={"Y:"}
                                width={"20px"} updateData={(val) => {
                                    props.updateRotation([props.rotation[0], val, props.rotation[2]])
                                }}
                        />
                    : null
                }
                {
                    !props.isAutoRotation ?
                        <Slider min={0} max={360} step={1} value={props.rotation[2]} caption={"Z:"}
                                width={"20px"} updateData={(val) => {
                                    props.updateRotation([props.rotation[0], props.rotation[1], val])
                                }}
                        />
                    : null
                }
            </fieldset>
        : null
    )
}

export function ViewBox(props) {
    let updateFunction = (event) => {
        props.updateFunIndex({funIndex: Number(event.target.value)});
    }
    let updateCheckbox = (event) => {
        props.updateIsLegend({isLegend: event});
    }
    let updateNumColors = (event) => {
        props.updateNumColors({numColors: Number(event)});
    }
    return (
        props.mesh && props.mesh.func.length ?
            <fieldset className="viewBox">
                <legend>View</legend>
                <ListBox name={"Function"} label={"Function:"} mesh={props.mesh} index={0} width={"70px"}
                         value={props.funIndex} updateData={updateFunction}/>
                <Slider min={32} max={256} step={32} value={props.numColors} enabled={true} caption={"Colors:"}
                        updateData={updateNumColors}/>
                <CheckBox isChecked={props.isLegend} caption={"Legend"} updateData={updateCheckbox}/>
            </fieldset>
        : null
    )
}

export function VisualizationBox(props) {
    let updateRadio = (event) => {
        if (event === "Mesh and surface") {
            props.updateRadio(0);
        } else if (event === "Mesh") {
            props.updateRadio(1);
        } else {
            props.updateRadio(2);
        }
    }
    return (
        props.mesh ?
            <fieldset className="visualizationBox">
                <legend>Visualization</legend>
                <RadioButton name="ViewOption" value="Mesh and surface"
                             checked={props.isSurface && props.isMesh}
                             updateData={updateRadio}/>
                <RadioButton name="ViewOption" value="Mesh" checked={!props.isSurface && props.isMesh}
                             updateData={updateRadio}/>
                <RadioButton name="ViewOption" value="Surface" checked={props.isSurface && !props.isMesh}
                             updateData={updateRadio}/>
                <CheckBox isChecked={props.isAxes} caption={"Coordinate axes"}
                          updateData={props.updateIsAxes}/>
            </fieldset>
        : null
    )
}

export function TranslationSceneBox(props) {
    let updateTranslateX = (event) => {
        props.updateTranslate([Number(event), props.translate[1], props.translate[2]])
    }
    let updateTranslateY = (event) => {
        props.updateTranslate([props.translate[0], Number(event), props.translate[2]])
    }
    return (
        props.mesh ?
            <fieldset className="TranslationSceneBox">
                <legend>Translation scene</legend>
                <Slider min={-1.00} max={1.00} step={0.25} value={props.translate[0]} enabled={true}
                        caption={"X:"} width={"20px"}
                        updateData={updateTranslateX}/>
                <Slider min={-1.00} max={1.00} step={0.25} value={props.translate[1]} enabled={true}
                        caption={"Y:"} width={"20px"}
                        updateData={updateTranslateY}/>
            </fieldset>
        : null
    )
}

export function TransformationObjectBox(props) {
    let updateTransformationX = (event) => {
        props.updateTransformationIndex([Number(event.target.value), props.transformation.index[1],
            props.transformation.index[2]])
    }
    let updateTransformationY = (event) => {
        props.updateTransformationIndex([props.transformation.index[0], Number(event.target.value),
            props.transformation.index[2]])
    }
    let updateTransformationZ = (event) => {
        props.updateTransformationIndex([props.transformation.index[0], props.transformation.index[1],
            Number(event.target.value)])
    }
    let updateTransformationRatio = (event) => {
        props.updateTransformationRatio(event)
    }
    return (
        props.mesh && props.mesh.func.length ?
            <fieldset className="transformationObjectBox">
                <legend>Transformation object</legend>
                <ListBox name="Function" label="X:" mesh={props.mesh} index={0} width="20px"
                         value={props.transformation.index[0]} updateData={updateTransformationX}/>
                <ListBox name="Function" label="Y:" mesh={props.mesh} index={1} width="20px"
                         value={props.transformation.index[1]} updateData={updateTransformationY}/>
                {
                    props.mesh.feType.indexOf("fe2d") === -1 ?
                        <ListBox name="Function" label="Z:" mesh={props.mesh} index={2} width="20px"
                                 value={props.transformation.index[2]} updateData={updateTransformationZ}/>
                        : null
                }
                <Slider min={0} max={0.5} step={0.1} value={props.transformation.ratio} enabled={true}
                        caption="Ratio:" updateData={updateTransformationRatio}/>
            </fieldset>
        : null
    )
}

export function ScaleSceneBox(props) {
    return (
        props.mesh ?
            <fieldset className="scaleSceneBox">
                <legend>Scale scene</legend>
                <Slider min={0.5} max={5.0} step={0.5} value={props.scale} enabled={true} caption="Ratio:"
                        updateData={props.updateScale}/>
            </fieldset>
        : null
    )
}

export function ParamTable(props)  {
    const [cols] = React.useState(props.data.length ? props.data[0].length ? props.data[0].length : 0 : 0);
    const rows = [];
    const headers = [];
    for (const title of props.headers) {
        headers.push(<th key={title} rowSpan="2">{title}</th>);
    }
    if (props.direct === "on") {
        headers.push(<th key="Direction" colSpan="4">Direction</th>);
    }
    for (let i = 0; i < props.data.length; i++) {
        let row = [];
        for (let j = 0; j < props.data[i].length; j++) {
            if (props.direct === "on" && j === props.data[i].length - 1) {
                continue;
            }
            row.push(<td key={i.toString() + "_" + j.toString()}>
                <input id={i.toString() + "_" + j.toString()} type={props.colType[j] === "str" ?
                    "text" : "number"} step="any" defaultValue={props.data[i][j]}
                       onChange={(event) => {
                           let row = Number(event.target.id.substring(0, event.target.id.search("_")));
                           let col = Number(event.target.id.substring(event.target.id.search("_") + 1, event.target.id.length));
                           let table = [...props.data];
                           table[row][col] = event.target.value;
                           props.updateData(table);
                       }}/>
            </td>);
        }
        if (props.direct === "on") {
            let mask = [1, 2, 4]; // X, Y or Z
            for (let j = 0; j < 3; j++) {
                let value = Number(props.data[i][props.data[i].length - 1]) & mask[j];
                row.push(
                    <td key={j}><input id={i.toString() + "_" + j.toString()} type="checkbox"
                                       checked={Boolean(value)}
                                       onChange={(event) => {
                                           let index = Number(event.target.id.substring(0, 1));
                                           let table = [...props.data];
                                           table[index][table[index].length - 1] ^= mask[j];
                                           props.updateData(table);
                                           //alert("New value: " + table[index][table[index].length - 1]);
                                       }}/>
                    </td>
                )
            }
        }
        rows.push(<tr key={i}>{row}</tr>);
    }
    return (
        <table>
            <thead>
            <tr>{headers}</tr>
            {props.direct === "on" ? <tr>
                <th key="X">X</th>
                <th key="Y">Y</th>
                <th key="Z">Z</th>
            </tr> : null}
            </thead>
            <tbody>{rows}
            <tr>
                <td>
                    <input type="button" value="add" onClick={() => {
                        let row = [];
                        for (let j = 0; j < cols; j++) {
                            if (props.direct === "on" && j === cols - 1) {
                                continue;
                            }
                            row.push("");
                        }
                        if (props.direct === "on") {
                            row.push(0);
                        }
                        let table = [...props.data, row];
                        props.updateData(table);
                    }}/>
                    <input type="button" value="del" disabled={!props.data.length} onClick={() => {
                        let table = [...props.data];
                        table.splice(table.length - 1, 1);
                        props.updateData(table);
                    }}/>
                </td>
            </tr>
            </tbody>
        </table>
    );
}
