import {loadFile} from "./file";


onmessage = function(file) {
    loadFile(file.data).then((value) => {
        postMessage({status: "success", mesh: value.mesh});
    }).catch(() => {
        //alert("Failed to load file!")
        postMessage({status: "failure", mesh: null});
    });
};
