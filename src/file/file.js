// Load *.mesh file (internal format)
import {createMatrix} from "../draw/utils";

export function loadMesh(fileData, mesh) {
    let row = getRow(fileData).row;
    if (row === "Mesh") {
        row = getRow(fileData).row;
    }
    // Get FE type
    switch (row) {
        case "fe2d3":
        case "3":
            mesh.feType = "fe2d3";
            break;
        case "fe2d4":
        case "24":
            mesh.feType = "fe2d4";
            break;
        case "fe3d4":
        case "4":
            mesh.feType = "fe3d4";
            break;
        case "fe3d8":
        case "8":
            mesh.feType = "fe3d8";
            break;
        case "fe3d3s":
        case "223":
            mesh.feType = "fe3d3s";
            break;
        case "fe3d4s":
        case "224":
            mesh.feType = "fe3d4s";
            break;
        default:
            console.log("Wrong mesh format!");
            //alert("Wrong mesh format!");
            return false;
    }
    let numVertex = Number(getRow(fileData).row);
    // Get vertex coordinates
    for (let i = 0; i < numVertex; i++) {
        let words = getRow(fileData).row.trim().split(' ');
        let x = [];
        for (let j = 0; j < words.length; j++) {
            if (words[j] !== "") {
                x.push(Number(words[j]));
            }
        }
        mesh.x.push(x);
    }
    // Get FE number
    let numFE = Number(getRow(fileData).row);
    // Get FE indexes
    for (let i = 0; i < numFE; i++) {
        let words = getRow(fileData).row.trim().split(' ');
        let fe = [];
        for (let j = 0; j < words.length; j++) {
            if (words[j] !== "") {
                fe.push(Number(words[j]));
            }
        }
        mesh.fe.push(fe);
    }
    // Get BE number
    let numBE = Number(getRow(fileData).row);
    // Get BE indexes
    for (let i = 0; i < numBE; i++) {
        let words = getRow(fileData).row.trim().split(' ');
        let be = [];
        for (let j = 0; j < words.length; j++) {
            if (words[j] !== "") {
                be.push(Number(words[j]));
            }
        }
        mesh.be.push(be);
    }
    if (mesh.feType === "fe3d3s" || mesh.feType === "fe3d4s") {
        mesh.be = mesh.fe;
    }
    return true
}

function getRow(file) {
    let eof = false;
    let offset = 2;
    let index = file.data.indexOf("\r\n");
    if (index === -1) {
        index = file.data.indexOf("\n");
        offset = 1;
    }
    let ret;
    if (index !== -1) {
        ret = file.data.slice(0, index);
        file.data = file.data.slice(index + offset, file.data.length);
        if (file.data.length === 0) {
            eof = true;
        }
    } else {
        ret = file.data.slice(0, file.data.length);
        eof = true;
    }
    return {row: ret, eof: eof};
}

// Load *.vol file (NetGen)
export function loadVol(fileData, mesh) {
    // Get boundary elements
    let data = getRow(fileData);
    while (!data.eof) {
        if (data.row === "surfaceelements") {
            break;
        }
        data = getRow(fileData);
    }
    if (data.eof) {
        console.log("Wrong VOL-file format");
        return false;
    }

    mesh.feType = "fe3d4";
    // Get BE number
    let num = Number(getRow(fileData).row);
    // Get BE indexes
    for (let i = 0; i < num; i++) {
        let words = getRow(fileData).row.trim().split(' ');
        let be = [];
        for (let j = 0; j < 3; j++) {
            if (words[j] !== "") {
                be.push(Number(words[j + 5]) - 1);
            }
        }
        mesh.be.push(be);
    }

    // Get finite elements
    data = getRow(fileData);
    while (!data.eof) {
        if (data.row === "volumeelements") {
            break;
        }
        data = getRow(fileData);
    }
    if (data.eof) {
        console.log("Wrong VOL-file format");
        return false;
    }

    // Get FE number
    num = Number(getRow(fileData).row);
    // Get FE indexes
    for (let i = 0; i < num; i++) {
        let words = getRow(fileData).row.trim().split(' ');
        let fe = [];
        for (let j = 0; j < 4; j++) {
            if (words[j] !== "") {
                fe.push(Number(words[j]) - 1);
            }
        }
        mesh.fe.push(fe);
    }

    // Get vertex coordinates
    data = getRow(fileData);
    while (!data.eof) {
        if (data.row === "points") {
            break;
        }
        data = getRow(fileData);
    }
    if (data.eof) {
        console.log("Wrong VOL-file format");
        return false;
    }

    // Get vertex number
    num = Number(getRow(fileData).row);
    // Get vertexes
    for (let i = 0; i < num; i++) {
        let words = getRow(fileData).row.trim().split(' ');
        let x = [];
        for (let j = 0; j < words.length; j++) {
            if (words[j] !== "") {
                x.push(Number(words[j]));
            }
        }
        mesh.x.push(x);
    }
    return true;
}

// Load *.msh file (GMSH)
export function loadMsh(fileData, mesh) {
    // Get boundary elements
    let data = getRow(fileData);

    if (data.row !== "$MeshFormat") {
        console.log("Wrong MSH-file format");
        return false;
    }
    data = getRow(fileData);
    while (!data.eof) {
        if (data.row === "$Nodes") {
            break;
        }
        data = getRow(fileData);
    }
    if (data.eof) {
        console.log("Wrong MSH-file format");
        return false;
    }
    let words = getRow(fileData).row.trim().split(' ');
    let numEntities = Number(words[0]);
    let is2d = true;
    for (let i = 0; i < numEntities; i++) {
        words = getRow(fileData).row.trim().split(' ');
        let num = Number(words[3]);
        // Ignoring tags
        for (let j = 0; j < num; j++) {
            data = getRow(fileData);
        }
        for (let j = 0; j < num; j++) {
            let x = [];
            words = getRow(fileData).row.trim().split(' ');
            for (let k = 0; k < 3; k++) {
                x.push(Number(words[k]));
            }
            if (Math.abs(x[2]) > 1.0e-10) {
                is2d = false;
            }
            mesh.x.push(x);
        }
    }
    if (getRow(fileData).row !== "$EndNodes") {
        console.log("Wrong MSH-file format");
        return false;
    }
    if (getRow(fileData).row !== "$Elements") {
        console.log("Wrong MSH-file format");
        return false;
    }
    // Number of section
    words = getRow(fileData).row.trim().split(' ');
    numEntities = Number(words[0]);
    let minTag = Number(words[2]);
    for (let i = 0; i < numEntities; i++) {
        words = getRow(fileData).row.trim().split(' ');
        let dim = Number(words[0]);
        let elmType = Number(words[2]);
        let num = Number(words[3]);
        for (let j = 0; j < num; j++) {
            data = getRow(fileData);
            if (dim === 0 || (dim === 1 && is2d === false)) {
                continue;
            }
            words = data.row.trim().split(' ');
            // Reading current element
            let elm = [];
            for (let k = 1; k < words.length; k++) {
                elm.push(Number(words[k]) - minTag);
            }
            switch (elmType) {
                case 1: // 2-node line
                    if (is2d) {
                        // Boundary element
                        mesh.be.push(elm);
                    }
                    break;
                case 2: // 3-node triangle
                    if (is2d) {
                        // Finite element
                        mesh.fe.push(elm);
                    } else {
                        // Boundary element
                        mesh.be.push(elm);
                    }
                    break;
                case 4: // 4-node tetrahedron
                    if (!is2d) {
                        // Finite element
                        mesh.fe.push(elm);
                    } else {
                        console.log("This format of MSH-file is not supported");
                        return false;
                    }
                    break;
                default:
                    console.log("This format of MSH-file is not supported");
                    return false;
            }
        }
    }
    if (getRow(fileData).row !== "$EndElements") {
        console.log("Wrong MSH-file format");
        return false;
    }
    if (is2d) {
        mesh.feType = "fe2d3";
    } else {
        mesh.feType = "fe3d4";
        if (mesh.be.length === 0) {
            mesh.be = mesh.fe;
            mesh.feType = "fe3d3s";
        }
    }
    return true;
}

export function loadRes(fileData, mesh) {
    // Get signature
    let row = getRow(fileData).row;
    if (row !== "QFEM results file" && row !== "FEM Solver Results File") {
        console.log("Wrong Results-file format");
        return false;
    }
    // Get mesh
    if (!loadMesh(fileData, mesh)) {
        return false;
    }
    if (getRow(fileData).row === "Results") {
        getRow(fileData);
    }
    return loadResults(fileData, mesh);
}

function loadResults(fileData, mesh) {
    let numFun = Number(getRow(fileData).row);
    for (let i = 0; i < numFun; i++) {
        let name = getRow(fileData).row;
        getRow(fileData);
        let num = Number(getRow(fileData).row);
        let data = [];
        for (let j = 0; j < num; j++) {
            let val = Number(getRow(fileData).row);
            data.push(val);
        }
        let minMax = getMinMax(data);
        mesh.func.push({name: name, results: data, minU: minMax.minU, maxU: minMax.maxU});
    }
    return true;
}

// Calc min and max value of function
function getMinMax(data) {
    let minU = data[0];
    let maxU = data[0];
    for (let i = 1; i < data.length; i++) {
        if (data[i] < minU) {
            minU = data[i];
        }
        if (data[i] > maxU) {
            maxU = data[i];
        }
    }
    return {minU: minU, maxU: maxU};
}

// РњР†Р Р•Р›Рђ
export function loadTxt(fileData, mesh) {
    let str;
    let data = getRow(fileData);
    let attrib = [];
    while (!data.eof) {
        if (data.row.includes("M1 x M2 x M3")) {
            break;
        }
        data = getRow(fileData);
    }
    if (data.eof) {
        console.log("Wrong TXT-file format");
        return false;
    }

    str = data.row;
    str = str.replace(/\s/g, '').substring(str.indexOf("M1xM2xM3") + "M1xM2xM3".length + 1).replace(/x/gi, " ");
    let words = str.trim().split(' ');
    let m = [Number(words[0]), Number(words[1]), Number(words[2])];
    let size = m[0] * m[1] * m[2];

    while (!data.eof) {
        if (data.row.includes("NU")) {
            break;
        }
        data = getRow(fileData);
    }
    if (data.eof) {
        console.log("Wrong TXT-file format");
        return false;
    }
    getRow(fileData);
    for (let i = 0; i < size; i++) {
        data = getRow(fileData);
        if (data.eof) {
            console.log("Wrong TXT-file format");
            return false;
        }
        str = data.row.trim().replace(/\s+/g, "x").replace(/D/gi, "E");
        words = str.trim().split('x');
        mesh.x.push([Number(words[1]), Number(words[2]), Number(words[3])]);
        attrib.push(Number(words[8]));
    }
    createFE(mesh, m, attrib);

    let iter = 0;
    while (1) {
        data = getRow(fileData);
        if (data.eof) {
            break;
        }

        if (data.row.includes("ITER=")) {
            str = data.row;
            iter = Number(str.substring(str.indexOf("ITER=") + "ITER=".length + 1).trim());
            continue;
        }
        if (data.row.includes("NU")) {
            str = data.row.trim().replace(/\s+/g, "|");
            let names = str.trim().split('|');
            let u = createMatrix(9, size);
            getRow(fileData);
            for (let i = 0; i < size; i++) {
                data = getRow(fileData);
                if (data.eof) {
                    console.log("Wrong TXT-file format");
                    return false;
                }
                str = data.row.trim().replace(/\s+/g, "x").replace(/D/gi, "E");
                words = str.trim().split('x');
                for (let j = 0; j < 9; j++) {
                    u[j][i] = Number(words[j + 1]);
                }
            }
            for (let j = 1; j < 9; j++) {
                let minMax = getMinMax(u[j]);
                mesh.func.push({name: names[j] + "(" + String(iter) + ")", results: u[j], minU: minMax.minU, maxU: minMax.maxU});
            }
        }
    }
    createBE(mesh);
    mesh.feType = "fe3d8";
    return true;
}

function createFE(mesh, m, attrib) {
    let testFE = new Array(mesh.x.length);
    let index1 = 0;
    let index2 = 0;
    let tmp = createMatrix(mesh.x.length, 8);
    for (let n3 = 1; n3 < m[2]; n3++) {
        for (let n2 = 1; n2 < m[1]; n2++) {
            for (let n1 = 1; n1 < m[0]; n1++) {
                let nf = n1 + m[0] * (n2 - 1) + m[0] * m[1] * (n3 - 1);
                for (let k3 = 1; k3 < 3; k3++) {
                    for (let k2 = 1; k2 < 3; k2++) {
                        for (let k1 = 1; k1 < 3; k1++) {
                            let ne = nf + (k1 - 1) + m[0] * (k2 - 1) + m[0] * m[1] * (k3 - 1);
                            if (attrib[ne - 1] < 0) {
                                testFE[index1] = 1;
                            }
                            tmp[index1][index2++] = ne - 1;
                            if (index2 === 8) {
                                index1++;
                                index2 = 0;
                            }
                        }
                    }
                }
            }
        }
    }
    let numFE = index1;
    let numBadFE = 0;
    for (let i = 0; i < numFE; i++) {
        if (testFE[i]) {
            numBadFE++;
        }
    }
    if (numBadFE) {
        let tFE = createMatrix(numFE - numBadFE, 8);
        let noFE = 0;
        for (let i = 0; i < numFE; i++) {
            if (!testFE[i]) {
                for (let j = 0; j < 8; j++) {
                    tFE[noFE][j] = tmp[i][j];
                }
                noFE++;
            }
        }
        mesh.fe = tFE;
        //numFE -= numBadFE;
    } else {
        mesh.fe = new Array(numFE);
        for (let i = 0; i < numFE; i++) {
            mesh.fe[i] = tmp[i];
        }
    }
}

function createBE(mesh) {
    let cData = [
        [0, 4, 5, 1, 7],
        [6, 2, 3, 7, 0],
        [4, 6, 7, 5, 0],
        [2, 0, 1, 3, 5],
        [1, 5, 7, 3, 4],
        [6, 4, 0, 2, 1]
    ];
    let p = new Array(6);
    let pp = new Array(6);
    let data = new Array(6);

    let num1 = 6;
    let num2 = 4;
    let boundList = createMatrix(6 * mesh.fe.length,num1 + 1);
    for (let i = 0; i < mesh.fe.length - 1; i++) {
        for (let j = 0; j < num1; j++) {
            if (boundList[i][j] === undefined) {
                for (let l = 0; l < num2; l++) {
                    p[l]  = mesh.fe[i][cData[j][l]];
                }
                for (let k = i + 1; k < mesh.fe.length; k++) {
                    for (let m = 0; m < num1; m++) {
                        if (boundList[k][m] === undefined) {
                            for (let l = 0; l < num2; l++) {
                                pp[l] = mesh.fe[k][cData[m][l]];
                            }
                            if (test(p, pp)) {
                                boundList[i][j] = boundList[k][m] = 1;
                            }
                        }
                    }
                }
            }
        }
    }

    let numFaces = 0;
    for (let i = 0; i < mesh.fe.length; i++) {
        for (let j = 0; j < num1; j++) {
            if (boundList[i][j] === undefined) {
                numFaces++;
            }
        }
    }

    let surface = createMatrix(numFaces,num2 + 2);
    numFaces = 0;
    for (let i = 0; i < mesh.fe.length; i++) {
        for (let j = 0; j < num1; j++) {
            if (boundList[i][j] === undefined) {
                let cx = mesh.x[mesh.fe[i][cData[j][4]]][0];
                let cy = mesh.x[mesh.fe[i][cData[j][4]]][1];
                let cz = mesh.x[mesh.fe[i][cData[j][4]]][2];

                let x1 = mesh.x[mesh.fe[i][cData[j][0]]][0];
                let y1 = mesh.x[mesh.fe[i][cData[j][0]]][1];
                let z1 = mesh.x[mesh.fe[i][cData[j][0]]][2];

                let x2 = mesh.x[mesh.fe[i][cData[j][1]]][0];
                let y2 = mesh.x[mesh.fe[i][cData[j][1]]][1];
                let z2 = mesh.x[mesh.fe[i][cData[j][1]]][2];

                let x3 = mesh.x[mesh.fe[i][cData[j][2]]][0];
                let y3 = mesh.x[mesh.fe[i][cData[j][2]]][1];
                let z3 = mesh.x[mesh.fe[i][cData[j][2]]][2];

                for (let l = 0; l < num2; l++) {
                    data[l] = cData[j][l];
                }

                if ( ((cx-x1)*(y2-y1)*(z3-z1) + (cy-y1)*(z2-z1)*(x3-x1) + (y3-y1)*(cz-z1)*(x2-x1) -
                    (x3-x1)*(y2-y1)*(cz-z1) - (y3-y1)*(z2-z1)*(cx-x1) - (cy-y1)*(z3-z1)*(x2-x1)) > 0) {
                    data[0] = cData[j][0];
                    data[1] = cData[j][3];
                    data[2] = cData[j][2];
                    data[3] = cData[j][1];
                }
                for (let l = 0; l < num2; l++) {
                    surface[numFaces][l] = mesh.fe[i][data[l]];
                }
                numFaces++;
            }
        }
    }
    mesh.be = createMatrix(surface.length, 4);
    for (let i = 0; i < surface.length; i++) {
        for (let j = 0; j < 4; j++) {
            mesh.be[i][j] = surface[i][j];
        }
    }
}

function test(a, b)
{
    let result;
    for (let i = 0; i < 4; i++) {
        result = false;
        for (let j = 0; j < 4; j++) {
            if (b[j] === a[i]) {
                result = true;
                break;
            }
        }
        if (result === false) {
            return false;
        }
    }
    return true;
}

export function loadFile(file) {
    return new Promise(function(resolve, reject) {
        let fileExt = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
        let reader = new FileReader();
        reader.readAsText(file);

        // Mesh & results data structure
        let mesh = {
            feType: "", // Type of mesh
            x: [],      // Vertex coordinates
            fe: [],     // Finite element
            be: [],     // Boundary elements
            func: [],   // Results data
        };
        reader.onload = function () {
            let ok = false;
            let fileData = {
                data: reader.result
            };
            switch (fileExt.toUpperCase()) {
                case "MESH":
                    ok = loadMesh(fileData, mesh);
                    break;
                case "VOL":
                    ok = loadVol(fileData, mesh);
                    break;
                case "MSH":
                    ok = loadMsh(fileData, mesh);
                    break;
                case "RES":
                case "QRES":
                    ok = loadRes(fileData, mesh);
                    break;
                case "TXT":
                    ok = loadTxt(fileData, mesh);
                    break;
                default:
                    console.log("Unknown file format!");
                    //alert("Unknown file format!");
                    reject({mesh: null});
                    return;
            }
            if (ok) {
                resolve({mesh: mesh});
            } else {
                console.log("Unable to read file!");
                //alert("Unable to read file!");
                reject({mesh: null});
            }
        };
        reader.onerror = function () {
            //alert(reader.error);
            console.log(reader.error);
            reject({mesh: null});
        };
    });
}