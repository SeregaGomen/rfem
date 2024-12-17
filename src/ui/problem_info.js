import React from "react";
import axios from "axios";
import {Link} from "react-router-dom";

/**
 * @param props
 * @param props.problemInfo
 * @param props.problemInfo.Res
 * @param props.problemInfo.Res.Min
 * @param props.problemInfo.Res.Max
 * @param props.problemInfo.BoundaryCondition
 * @param props.problemInfo.BoundaryCondition.Value
 * @param props.problemInfo.BoundaryCondition.Predicate
 * @param props.problemInfo.BoundaryCondition.Direct
 * @param props.problemInfo.DateTime
 * @param props.problemInfo.Mesh
 * @param props.problemInfo.NameFE
 * @param props.problemInfo.NumFE
 * @param props.problemInfo.NumVertex
 * @param props.problemInfo.Results
 * @param props.problemInfo.LeadTime
 *
 */
export function CalculationProblemInfo(props)  {
    if (props.problemInfo.Error.length) {
        return (
            <div>
                <h1>The problem has been solving {props.problemInfo.DateTime}</h1>
                <h2>Error: {props.problemInfo.Error}</h2>
            </div>
        );
    }


    let direct = (value, dir) => {
        return value & dir ? '+' : null;
    }
    let leadTime = props.problemInfo.LeadTime < 60 ? props.problemInfo.LeadTime
        .toFixed(2) + " sec" :
        new Date(1970, 0, 0, 0, 0,+props.problemInfo.LeadTime || 0)
            .toLocaleTimeString(new Intl.DateTimeFormat().resolvedOptions().locale)
    let format = (value) => {
        let res = value.toExponential(6).toString();
        if (Math.sign(value) !== -1) {
            res = "+" + res;
        }
        return res;
    }
    let res = props.problemInfo.Res.map((item, i) => (
        <tr key={i}><td>{item.Name}</td><td>{format(item.Min)}</td><td>{format(item.Max)}</td></tr>)
    );
    let variables = props.problemInfo.Variables ?
        props.problemInfo.Variables.map((item, i) => (
            <tr key={i}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
            </tr>
        )) : [];
    let boundaryCondition = props.problemInfo.BoundaryCondition ?
        props.problemInfo.BoundaryCondition.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];
    let volumeLoad = props.problemInfo.VolumeLoad ?
        props.problemInfo.VolumeLoad.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];
    let surfaceLoad = props.problemInfo.SurfaceLoad ?
        props.problemInfo.SurfaceLoad.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];
    let pointLoad = props.problemInfo.PointLoad ?
        props.problemInfo.PointLoad.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
                <td>{direct(item.Direct, 1)}</td>
                <td>{direct(item.Direct, 2)}</td>
                <td>{direct(item.Direct, 4)}</td>
            </tr>
        )) : [];

    let pressureLoad = props.problemInfo.PressureLoad ?
        props.problemInfo.PressureLoad.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];
    let thickness = props.problemInfo.Thickness ?
        props.problemInfo.Thickness.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];
    let youngModulus = props.problemInfo.YoungModulus ?
        props.problemInfo.YoungModulus.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];
    let poissonRatio = props.problemInfo.PoissonRatio ?
        props.problemInfo.PoissonRatio.map((item, i) => (
            <tr key={i}>
                <td>{item.Value}</td>
                <td>{item.Predicate}</td>
            </tr>
        )) : [];

    return (
        <div>
            <h1>The problem has been solving {props.problemInfo.DateTime}</h1>
            <h2>Results of calculation</h2>
            Lead time: {leadTime}<br/>
            Parameters of the stress-strain state:
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Function</td>
                    <td>Min</td>
                    <td>Max</td>
                </tr>
                </thead>
                <tbody>{res}</tbody>
            </table>

            <h2>Mesh</h2>
            File: {props.problemInfo.Mesh}<br/>
            Type: {props.problemInfo.NameFE}<br/>
            Nodes: {props.problemInfo.NumVertex}<br/>
            Finite elements: {props.problemInfo.NumFE}

            <h2>Base settings</h2>
            Threads: {props.problemInfo.NumThread}<br/>
            Tolerance: {props.problemInfo.Eps}<br/>

            {
                variables.length ?
                    <div>
                        <h2>Variables</h2>
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Name</td>
                                <td>Value</td>
                            </tr>
                            </thead>
                            <tbody>{variables}</tbody>
                        </table>
                        <br/>
                    </div> : null
            }

            <h2>Elasticity parameters</h2>
            Young modulus:
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Value</td>
                    <td>Predicate</td>
                </tr>
                </thead>
                <tbody>{youngModulus}</tbody>
            </table><br/>
            Poisson's ratio:
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Value</td>
                    <td>Predicate</td>
                </tr>
                </thead>
                <tbody>{poissonRatio}</tbody>
            </table>

            {
                thickness.length ?
                    <div>
                        <h2>Thickness</h2>
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                            </tr>
                            </thead>
                            <tbody>{thickness}</tbody>
                        </table>
                    </div> : null
            }


            <h2>Loads</h2>
            {
                volumeLoad.length ?
                    <div>
                        Volume load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                                <td>X</td>
                                <td>Y</td>
                                <td>Z</td>
                            </tr>
                            </thead>
                            <tbody>{volumeLoad}</tbody>
                        </table>
                    </div> : null
            }

            {
                surfaceLoad.length ?
                    <div>
                        Surface load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                                <td>X</td>
                                <td>Y</td>
                                <td>Z</td>
                            </tr>
                            </thead>
                            <tbody>{surfaceLoad}</tbody>
                        </table>
                    </div> : null
            }

            {
                pointLoad.length ?
                    <div>
                        Point load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                                <td>X</td>
                                <td>Y</td>
                                <td>Z</td>
                            </tr>
                            </thead>
                            <tbody>{pointLoad}</tbody>
                        </table>
                    </div> : null
            }

            {
                pressureLoad.length ?
                    <div>
                        Pressure load:
                        <table className="resultBox">
                            <thead>
                            <tr>
                                <td>Value</td>
                                <td>Predicate</td>
                            </tr>
                            </thead>
                            <tbody>{pressureLoad}</tbody>
                        </table>
                    </div> : null
            }

            <h2>Boundary condition</h2>
            <table className="resultBox">
                <thead>
                <tr>
                    <td>Value</td>
                    <td>Predicate</td>
                    <td>X</td>
                    <td>Y</td>
                    <td>Z</td>
                </tr>
                </thead>
                <tbody>{boundaryCondition}</tbody>
            </table>

            <br/>
            <input type="button" value="Download results" onClick={async () => {
                const fileUrl = window.serverURL + "/load_file?file=result/" + props.problemInfo.Results;
                try {
                    const response = await axios.get(fileUrl, {
                        responseType: 'blob', // Указываем, что ожидаем blob (файл)
                    });

                    // Создаем ссылку для скачивания файла
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', props.problemInfo.Results);
                    document.body.appendChild(link);
                    link.click();
                    link.remove(); // Удаляем ссылку из документа
                } catch (error) {
                    //console.error('Ошибка при загрузке файла:', error);
                    alert('Error downloading the file: ' + error);
                }
            }}/>
            <br/>
            <br/>
            <Link to="/">Home</Link>
        </div>
    );
}
