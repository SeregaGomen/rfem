import {
    initShaderProgram,
    degToRad,
    perspective,
    lookAt,
    inverse,
    multiply,
    xRotation,
    yRotate,
    zRotate,
    transpose,
    normalize,
    transformVector,
} from './utils';


class RenderMesh {
    constructor() {
        // Vertex shader
        this.vertexShaderSource = `
            //precision highp float;
            attribute vec4 a_position;
            attribute vec3 a_normal;
            attribute vec4 a_color;
        
            uniform mat4 u_worldViewProjection;
            uniform mat4 u_worldInverseTranspose;
            uniform vec4 u_translation_center;
            uniform vec4 u_translation;
            uniform vec4 u_scale;
          
        
            varying vec3 v_normal;
            varying vec4 v_color;
        
            void main() {
                // Multiply the position by the matrix.
                gl_Position = u_worldViewProjection * (u_scale * a_position - u_scale * u_translation_center)
                            - u_translation;
                //gl_Position = u_worldViewProjection * (a_position - vec4(0.5, 0.5, 0.5, 0.0));
        
                // orient the normals and pass to the fragment shader
                v_normal = mat3(u_worldInverseTranspose) * a_normal;
                v_color = a_color;
            }
        `;

        // Fragment shader
        this.fragmentShaderSource = `
            precision mediump float;
            //precision highp float;
        
            // Passed in from the vertex shader.
            varying vec3 v_normal;
            varying vec4 v_color;
        
            uniform vec3 u_reverseLightDirection;
            uniform vec4 u_color;
            uniform int u_is_mesh;
        
            void main() {
                // because v_normal is a varying it's interpolated
                // so it will not be a unit vector. Normalizing it
                // will make it a unit vector again
                vec3 normal = normalize(v_normal);
        
                float light = dot(normal, u_reverseLightDirection);
        
                //gl_FragColor = u_color;
            
                if (u_is_mesh == 0)
                    gl_FragColor = v_color;
                else
                    gl_FragColor = u_color;
            
                //gl_FragColor = v_color;
        
                // Lets multiply just the color portion (not the alpha)
                // by the light
                gl_FragColor.rgb *= abs(light);
            }
        `;
        this.gl = null;
        this.ctx = null;
        this.programInfo = null;
        this.buffers = null;

        this.isAutoRotation = true;
        this.numColors = 32;
        this.rotation = [0.0, 0.0, 0.0];
        this.translate = [0.0, 0.0, 0.0];
        this.scale = 1.0;
        this.mesh = null;
        this.funIndex = 0;
        this.isMesh = true;
        this.isSurface = true;
        this.isAxes = true;
        this.isLegend = true;
        this.isTransformation = false;
        this.transformation = {
            index: [0, 1, 2],
            ratio: 0.0,
        };

        this.numTri = 0;
        this.numSeg = 0;
        this.minU = [0.0, 0.0];
        this.maxU = [0.0, 0.0];
        this.colorTable = [];
        this.radius = 0.0;
        this.xc = [0.0, 0.0, 0.0];
        this.maxTransformRatio = 0.0;
        this.id = null;
        this.legend = {
            color: Array(7),
            value: Array(7),
        };

    }
    setTransformationRatio(ratio) {
        this.transformation.ratio = ratio;
        this.isTransformation = ratio !== 0;
        this.renderImage();
    }
    // getTransformationRatio(ratio) {
    //     return this.transformation.ratio;
    // }
    setTransformationIndex(index) {
        this.transformation.index = index;
        if (this.transformation.ratio) {
            this.renderImage();
        }
    }
    // getTransformationIndex() {
    //     return this.transformation.index;
    // }
    setTranslate(translate) {
        this.translate = translate;
    }
    // getTranslate() {
    //     return this.translate;
    // }
    setScale(scale) {
        this.scale = scale;
    }
    // getScale() {
    //     return this.scale;
    // }
    setIsSurface(isSurface) {
        this.isSurface = isSurface;
    }
    // getIsSurface() {
    //     return this.isSurface;
    // }
    setIsMesh(isMesh) {
        this.isMesh = isMesh;
    }
    // getIsMesh() {
    //     return this.isMesh;
    // }
    setIsAxes(isAxes) {
        this.isAxes = isAxes;
    }
    // getIsAxes(isAxes) {
    //     return this.isAxes;
    // }
    setIsAutoRotation(isAutoRotation) {
        this.isAutoRotation = isAutoRotation;
    }
    // getIsAutoRotation() {
    //     return this.isAutoRotation;
    // }
    setRotation(rotation) {
        this.rotation = rotation;
    }
    getRotation() {
        return this.rotation;
    }
    setIsLegend(isLegend) {
        this.isLegend = isLegend;
    }
    // getIsLegend(isLegend) {
    //     return this.isLegend;
    // }
    setNumColors(numColors) {
        this.numColors = numColors;
        this.renderImage();
    }
    // getNumColors(numColors) {
    //     return this.numColors;
    // }
    setFunIndex(funIndex) {
        this.funIndex = funIndex;
        this.renderImage();
    }
    // getFunIndex(funIndex) {
    //     return this.funIndex;
    // }
    setMesh(mesh) {
        this.mesh = mesh;
        this.funIndex = 0;
        this.numColors = 32;
        this.isLegend = true;
        this.isAutoRotation = true;
        this.isAxes = true;
        this.rotation = [0.0, 0.0, 0.0];
        this.translate = [0.0, 0.0, 0.0];
        this.scale = 1.0;
        this.isMesh = true;
        this.isSurface = true;
        this.transformation = {index: [0, 1, 2], ratio: 0.0};
        if (this.mesh) {
            this.renderImage();
        } else {
            cancelAnimationFrame(this.id);
            if (this.gl) {
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
        }

    }
    // getMesh(mesh) {
    //     return this.mesh;
    // }
    renderImage() {
        // Get a WebGL context
        let canvas = document.querySelector("canvas");
        this.gl = canvas.getContext("webgl");
        if (!this.gl) {
            alert("Failed to get the rendering context for WebGL");
            //console.log("Failed to get the rendering context for WebGL");
            return;
        }

        // Get a canvas text context
        let textCanvas = document.querySelector("#text");
        this.ctx = textCanvas.getContext("2d");

        // setup GLSL program
        const shaderProgram = initShaderProgram(this.gl, this.vertexShaderSource, this.fragmentShaderSource);
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                positionLocation: this.gl.getAttribLocation(shaderProgram, "a_position"),
                normalLocation: this.gl.getAttribLocation(shaderProgram, "a_normal"),
                colorLocation: this.gl.getAttribLocation(shaderProgram, "a_color"),
            },
            uniformLocations: {
                worldViewProjectionLocation: this.gl.getUniformLocation(shaderProgram, "u_worldViewProjection"),
                worldInverseTransposeLocation: this.gl.getUniformLocation(shaderProgram, "u_worldInverseTranspose"),
                worldTranslationCenter: this.gl.getUniformLocation(shaderProgram, "u_translation_center"),
                worldTranslation: this.gl.getUniformLocation(shaderProgram, "u_translation"),
                worldScale: this.gl.getUniformLocation(shaderProgram, "u_scale"),
                colorLocation: this.gl.getUniformLocation(shaderProgram, "u_color"),
                reverseLightDirectionLocation: this.gl.getUniformLocation(shaderProgram, "u_reverseLightDirection"),
                isMeshLocation: this.gl.getUniformLocation(shaderProgram, "u_is_mesh"),
            },
        };

        cancelAnimationFrame(this.id);
        this.minU = [0.0, 0.0];
        this.maxU = [0.0, 0.0];

        if (this.isTransformation) {
            this.maxTransformRatio = 0.0;
            for (let k = 0; k < (this.mesh.feType.indexOf("fe2d") === -1 ? 3 : 2); k++) {
                if (Math.abs(this.mesh.func[this.transformation.index[k]].maxU) > this.maxTransformRatio) {
                    this.maxTransformRatio = Math.abs(this.mesh.func[this.transformation.index[k]].maxU);
                }
                if (Math.abs(this.mesh.func[this.transformation.index[k]].minU) > this.maxTransformRatio) {
                    this.maxTransformRatio = Math.abs(this.mesh.func[this.transformation.index[k]].minU);
                }
            }
        }

        this.getRegion();
        this.setColorTable();
        // Create a buffers to put positions in
        this.buffers = this.createBuffers(this.radius);

        if (this.mesh.func.length) {
            this.createLegend();
        }
        // Draw the scene repeatedly
        this.render();
        //this.id = requestAnimationFrame(this.render.bind(this));
    }
    render() {
        let delta = 0.017;
        this.renderScene();
        if (this.isAutoRotation === true) {
            this.rotation[0] += delta;
            this.rotation[1] += 0.7 * delta;
            this.rotation[2] += 0.3 * delta;
        }
        this.id = requestAnimationFrame(this.render.bind(this));
    }


    // Draw the scene
    renderScene() {
        this.resizeCanvasToDisplaySize(this.gl.canvas);
        this.resizeCanvasToDisplaySize(this.ctx.canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        // Clear the canvas AND the depth buffer.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // Clear the 2D canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        if (!this.mesh) {
            cancelAnimationFrame(this.id);
            return;
        }


        // gl.enable(gl.POLYGON_OFFSET_FILL);
        // gl.polygonOffset(0.0, -1.0);

        // Enable the depth buffer
        this.gl.enable(this.gl.DEPTH_TEST);

        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.programInfo.program);

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.positionLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.surface_position);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 3;          // 3 components per iteration
        let type = this.gl.FLOAT;   // the data is 32bit floats
        let isNormalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.positionLocation, size, type, isNormalize, stride,
            offset);

        // Turn on the normal attribute
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.normalLocation);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.surface_normal);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.normalLocation, size, type, isNormalize, stride,
            offset);

        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.surface_color);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.colorLocation, size, type, isNormalize, stride,
            offset);

        // Compute the projection matrix
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        let zNear = 0.1 * this.radius;
        let zFar = 100 * this.radius;
        let projectionMatrix = perspective(degToRad(60), aspect, zNear, zFar);


        // Compute the camera's matrix
        let camera = [this.radius, this.radius, this.radius];
        let target = [0, 0, 0];
        let up = [0, 0, this.radius];
        let cameraMatrix = lookAt(camera, target, up);


        // Make a view matrix from the camera matrix.
        let viewMatrix = inverse(cameraMatrix);

        // Compute a view projection matrix
        let viewProjectionMatrix = multiply(projectionMatrix, viewMatrix);

        // Draw F at the origin
        let worldMatrix = xRotation(this.rotation[0]);

        yRotate(worldMatrix, this.rotation[1], worldMatrix);
        zRotate(worldMatrix, this.rotation[2], worldMatrix);

        // Multiply the matrices.
        let worldViewProjectionMatrix = multiply(viewProjectionMatrix, worldMatrix);
        let worldInverseMatrix = inverse(worldMatrix);
        let worldInverseTransposeMatrix = transpose(worldInverseMatrix);


        // Set the matrices
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.worldViewProjectionLocation, false,
            worldViewProjectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.worldInverseTransposeLocation, false,
            worldInverseTransposeMatrix);
        this.gl.uniform4f(this.programInfo.uniformLocations.worldTranslationCenter, this.xc[0], this.xc[1],
            this.xc[2], 0.0);
        this.gl.uniform4f(this.programInfo.uniformLocations.worldTranslation, -this.translate[0] * this.radius,
            -this.translate[1] * this.radius,
            -this.translate[2] * this.radius, 0.0);
        this.gl.uniform4f(this.programInfo.uniformLocations.worldScale, this.scale, this.scale, this.scale, 1.0);

        // Set the color to use
        //gl.uniform4fv(programInfo.uniformLocations.colorLocation, [0.2, 1, 0.2, 1]); // green

        // set the light direction.
        this.gl.uniform3fv(this.programInfo.uniformLocations.reverseLightDirectionLocation,
            normalize([0.5, 0.7, 1], null));

        // set the is mesh sign
        this.gl.uniform1i(this.programInfo.uniformLocations.isMeshLocation, 0);

        // Draw the geometry.
        if (this.isSurface) {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numTri);
        }

        this.gl.uniform1i(this.programInfo.uniformLocations.isMeshLocation, 1);
        this.gl.uniform4fv(this.programInfo.uniformLocations.colorLocation, [0.0, 0.0, 0.0, 1.0]); // black

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.mesh_position);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.positionLocation, size, type, isNormalize, stride,
            offset);
        // Draw the mesh
        if (this.isMesh) {
            this.gl.drawArrays(this.gl.LINES, offset, this.numSeg);
        }


        // Draw the coordinate axes
        if (this.isAxes) {
            this.gl.uniform4f(this.programInfo.uniformLocations.worldTranslationCenter, 0.0, 0.0, 0.0, 0.0);
            this.gl.uniform4f(this.programInfo.uniformLocations.worldTranslation, 1.5 * this.radius, this.radius,
                0.0, 0.0);
            this.gl.uniform4f(this.programInfo.uniformLocations.worldScale, 1.0, 1.0, 1.0, 1.0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.axes_position);
            this.gl.vertexAttribPointer(this.programInfo.attribLocations.positionLocation, size, type, isNormalize,
                stride, offset);
            // Turn on the normal attribute
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.normalLocation);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.drawArrays(this.gl.LINES, 0, 6);
            this.gl.enable(this.gl.DEPTH_TEST);
        }
        this.drawAxesLabel(worldViewProjectionMatrix, this.radius);

        if (this.isLegend && this.mesh.func.length) {
            this.showLegend();
        }
    }
    createLegend() {
        if (this.mesh.func.length !== 0) {
            let h = (this.maxU[0] - this.minU[0]) / 7.0;
            let start = this.getColorIndex(this.maxU[0]);
            let stop = this.getColorIndex(this.minU[0]);
            let step = (start - stop) / 6.0;

            for (let i = 0; i < 7; i++) {
                let index = i !== 6 ? Math.round(start - i * step) : stop;
                this.legend.color[i] = "rgb(" + 255 * this.colorTable[index][0] + ", " + 255 * this.colorTable[index][1]
                    + ", " + 255 * this.colorTable[index][2] + ")";
                this.legend.value[i] = ((x, f) => {
                    let value = x.toExponential(f);
                    return value >= 0 ? "+" + value : value;
                })(i === 6 ? this.minU[0] : this.maxU[0] - i * h, 5);
            }
        }
    }
    showLegend() {
        let top = 20;
        let left = 10;
        for (let i = 0; i < (this.minU[0] === this.maxU[0] ? 1 : 7); i++) {
            this.ctx.font = "14px monospace";
            this.ctx.fillStyle = this.legend.color[i];
            this.ctx.fillText("█", left,  top + i * 20);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(String(this.legend.value[i]), left + this.ctx.measureText("12").width,
                top + i * 20);
        }
    }
    createBuffers(radius) {
        let geometry = this.getGeometry();
        // Create a buffer to put positions in
        let positionBuffer = this.gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry.surface_positions), this.gl.STATIC_DRAW);

        // Create a buffer to put mesh positions in
        let meshPositionBuffer = this.gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, meshPositionBuffer);
        // Put geometry data into buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry.mesh_positions), this.gl.STATIC_DRAW);


        // Create a buffer to put normals in
        let normalBuffer = this.gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        // Put normals data into buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry.normals), this.gl.STATIC_DRAW);

        let surfaceColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, surfaceColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry.colors), this.gl.STATIC_DRAW);

        let axesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, axesBuffer);
        // Put geometry data into buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 0.05 * radius, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.05 * radius, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.05 * radius]), this.gl.STATIC_DRAW);

        return {
            surface_position: positionBuffer,
            mesh_position: meshPositionBuffer,
            axes_position: axesBuffer,
            surface_normal: normalBuffer,
            surface_color: surfaceColorBuffer,
        };
    }
    getColorIndex(u) {
        let ret = 0;
        if (this.minU[1] !== this.maxU[1]) {
            ret = Math.floor((u - this.minU[1]) / ((this.maxU[1] - this.minU[1]) /
                this.numColors)) - 1;
        }
        return ret < 0 ? 0 : ret >= this.colorTable.length ? this.colorTable.length - 1 : ret;
    }
    getGeometry() {
        let index = [[0, 1, 2], [2, 3, 0]];
        let elm = this.mesh.feType.indexOf("fe2d") === -1 ? this.mesh.be : this.mesh.fe;
        let len = this.mesh.feType === "fe2d4" || this.mesh.feType === "fe3d4s" ||
        this.mesh.feType === "fe3d8" ? 2 : 1;
        let positions = [];
        let normals = [];
        let colors = [];
        let mesh_positions = [];
        for (let i = 0; i < elm.length; i++) {
            for (let j = 0; j < len; j++) {
                let tri = []
                for (let k = 0; k < 3; k++) {
                    tri.push([
                        this.tX(elm[i][index[j][k]], 0),
                        this.tX(elm[i][index[j][k]], 1),
                        this.mesh.feType.indexOf("fe2d") === -1 ? this.tX(elm[i][index[j][k]], 2) : 0.0,
                        this.mesh.func.length !== 0 ?
                            this.mesh.func[this.funIndex].results[elm[i][index[j][k]]] : 0.0
                    ]);
                }
                this.setTriangle3d(tri, positions, normals, colors);
            }

            mesh_positions.push(this.tX(elm[i][0], 0), this.tX(elm[i][0], 1),
                this.mesh.feType.indexOf("fe2d") === -1 ? this.tX(elm[i][0], 2) : 0.0);
            for (let j = 1; j < (len === 1 ? 3 : 4); j++) {
                mesh_positions.push(this.tX(elm[i][j], 0), this.tX(elm[i][j], 1),
                    this.mesh.feType.indexOf("fe2d") === -1 ? this.tX(elm[i][j], 2) : 0.0,
                    this.tX(elm[i][j],0), this.tX(elm[i][j], 1),
                    this.mesh.feType.indexOf("fe2d") === -1 ? this.tX(elm[i][j], 2) : 0.0);
            }
            mesh_positions.push(this.tX(elm[i][0], 0), this.tX(elm[i][0], 1),
                this.mesh.feType.indexOf("fe2d") === -1 ? this.tX(elm[i][0], 2) : 0.0);
        }
        this.numTri = positions.length / 3;
        this.numSeg = mesh_positions.length / 3;
        return {surface_positions: positions, mesh_positions: mesh_positions, normals: normals, colors: colors}
    }
    setTriangle3d(tri, positions, normals, colors) {
        let normal = ((x) => {
            return [
                ((x[4] - x[1]) * (x[8] - x[2]) - (x[7] - x[1]) * (x[5] - x[2])),
                ((x[6] - x[0]) * (x[5] - x[2]) - (x[3] - x[0]) * (x[8] - x[2])),
                ((x[3] - x[0]) * (x[7] - x[1]) - (x[6] - x[0]) * (x[4] - x[1]))
            ];
        })([tri[0][0], tri[0][1], tri[0][2], tri[1][0], tri[1][1], tri[1][2], tri[2][0], tri[2][1], tri[2][2]]);
        let colorIndex = [this.getColorIndex(tri[0][3]), this.getColorIndex(tri[1][3]),
            this.getColorIndex(tri[2][3])];
        let index = (() => {
            if (tri[0][3] === tri[1][3] && tri[1][3] === tri[2][3]) {
                return [0, 1, 2];
            }
            let min_u = tri[0][3];
            let max_u = tri[0][3];
            let min_index = 0;
            let max_index = 0;
            for (let i = 1; i < 3; i++) {
                if (tri[i][3] < min_u) {
                    min_u = tri[i][3];
                    min_index = i;
                }
                if (tri[i][3] > max_u) {
                    max_u = tri[i][3];
                    max_index = i;
                }
            }
            return [min_index, 3 - min_index - max_index, max_index];
        })(tri);
        if ((colorIndex[0] === colorIndex[1]) && (colorIndex[1] === colorIndex[2])) {
            for (let i = 0; i < 3; i++) {
                positions.push(tri[index[i]][0], tri[index[i]][1], tri[index[i]][2]);
                normals.push(normal[0], normal[1], normal[2]);
                colors.push(this.colorTable[colorIndex[0]][0], this.colorTable[colorIndex[0]][1],
                    this.colorTable[colorIndex[0]][2]);
            }
        } else {
            let step = colorIndex[index[2]] - colorIndex[index[0]] + 1;
            let p02 = [];
            let x = [tri[index[0]][0], tri[index[0]][1], tri[index[0]][2], colorIndex[index[0]]];
            let h = [(tri[index[2]][0] - tri[index[0]][0]) / step, (tri[index[2]][1] - tri[index[0]][1]) / step,
                (tri[index[2]][2] - tri[index[0]][2]) / step, (colorIndex[index[2]] - colorIndex[index[0]]) / step];
            for (let i = 0; i < step; i++) {
                p02.push([x[0] + i * h[0], x[1] + i * h[1], x[2] + i * h[2], colorIndex[index[0]] + i * h[3]]);
            }
            p02.push([tri[index[2]][0], tri[index[2]][1], tri[index[2]][2], colorIndex[index[2]]]);

            step = colorIndex[index[1]] - colorIndex[index[0]] + 1;
            let p012 = [];
            x = [tri[index[0]][0], tri[index[0]][1], tri[index[0]][2], colorIndex[index[0]]];
            h = [(tri[index[1]][0] - tri[index[0]][0]) / step, (tri[index[1]][1] - tri[index[0]][1]) / step,
                (tri[index[1]][2] - tri[index[0]][2]) / step, (colorIndex[index[1]] - colorIndex[index[0]]) / step];
            for (let i = 1; i < step; i++) {
                p012.push([x[0] + i * h[0], x[1] + i * h[1], x[2] + i * h[2], colorIndex[index[0]] + i * h[3]]);
            }
            p012.push([tri[index[1]][0], tri[index[1]][1], tri[index[1]][2], colorIndex[index[1]]]);

            step = colorIndex[index[2]] - colorIndex[index[1]] + 1;
            x = [tri[index[1]][0], tri[index[1]][1], tri[index[1]][2], colorIndex[index[1]]];
            h = [(tri[index[2]][0] - tri[index[1]][0]) / step, (tri[index[2]][1] - tri[index[1]][1]) / step,
                (tri[index[2]][2] - tri[index[1]][2]) / step, (colorIndex[index[2]] - colorIndex[index[1]]) / step];
            for (let i = 1; i < step; i++) {
                p012.push([x[0] + i * h[0], x[1] + i * h[1], x[2] + i * h[2], colorIndex[index[1]] + i * h[3]]);
            }
            for (let i = 0; i < p02.length - 1; i++) {
                if (i < p012.length) {
                    let clr = Math.round(Math.min(p02[i][3], p02[i + 1][3], p012[i][3]));
                    colors.push(this.colorTable[clr][0], this.colorTable[clr][1], this.colorTable[clr][2],
                        this.colorTable[clr][0], this.colorTable[clr][1], this.colorTable[clr][2],
                        this.colorTable[clr][0], this.colorTable[clr][1], this.colorTable[clr][2]);
                    positions.push(p02[i][0], p02[i][1], p02[i][2], p012[i][0], p012[i][1], p012[i][2], p02[i + 1][0],
                        p02[i + 1][1], p02[i + 1][2]);
                    normals.push(normal[0], normal[1], normal[2], normal[0], normal[1], normal[2], normal[0], normal[1],
                        normal[2]);
                    if (i + 1 < p012.length) {
                        clr = Math.round(Math.min(p02[i + 1][3], p012[i][3], p012[i + 1][3]));
                        colors.push(this.colorTable[clr][0], this.colorTable[clr][1],
                            this.colorTable[clr][2], this.colorTable[clr][0],
                            this.colorTable[clr][1], this.colorTable[clr][2], this.colorTable[clr][0],
                            this.colorTable[clr][1], this.colorTable[clr][2]);
                        positions.push(p02[i + 1][0], p02[i + 1][1], p02[i + 1][2], p012[i][0], p012[i][1], p012[i][2],
                            p012[i + 1][0], p012[i + 1][1], p012[i + 1][2]);
                        normals.push(normal[0], normal[1], normal[2], normal[0], normal[1], normal[2], normal[0],
                            normal[1], normal[2]);
                    }
                }
            }
        }
    }
    setColorTable() {
        let step = this.numColors / 6;
        let h = 1.0 / step;
        let green = 0.0;
        let blue = 1.0;
        //let red = 0.24;
        let red = 1.0;

        if (this.mesh.func.length) {
            this.minU[0] = this.mesh.func[this.funIndex].minU;
            this.maxU[0] = this.mesh.func[this.funIndex].maxU;
            this.minU[1] = Math.abs(this.minU[0]) > Math.abs(this.maxU[0]) ?
                -Math.abs(this.minU[0]) : -Math.abs(this.maxU[0]);
            this.maxU[1] = Math.abs(this.minU[1]);
        }

        this.colorTable = [];
        for (let i = 0; i < this.numColors; i++) {
            if (i < step) {
                // purple - dark blue
                this.colorTable.push([red, 0.0, 1.0]);
                red = red < 0.0 ? 0.0 : red - h;
            } else if (step <= i && i < 2 * step) {
                // dark blue-blue
                this.colorTable.push([0.0, green, 1.0]);
                green = green > 1.0 ? 1.0 : green + h;
            } else if (2 * step <= i && i < 3 * step) {
                // blue-green
                this.colorTable.push([0.0, 1.0, blue]);
                blue = blue < 0.0 ? 0.0 : blue - h;
            } else if (3 * step <= i && i < 4 * step) {
                // green-yellow
                this.colorTable.push([red, 1.0, 0.0]);
                red = red > 1.0 ? 1.0 : red + h;
            } else if (i > 4 * step) {
                // yellow-orange-red
                this.colorTable.push([1.0, green, 0.0])
                green = green < 0.0 ? 0.0 : green - 0.5 * h;
            }
        }
    }
    drawAxesLabel(matrix, radius) {
        let label = ["X", "Y", "Z"];
        let point = [[0.06 * radius, 0, 0, 1], [0.0, 0.06 * radius, 0, 1], [0.0, 0.0, 0.06 * radius, 1]];
        for (let i = 0; i < 3; i++) {
            let clipSpace = transformVector(matrix, point[i]);
            clipSpace[0] = (clipSpace[0] - 1.5 * radius) / clipSpace[3];
            clipSpace[1] = (clipSpace[1] - radius) / clipSpace[3];
            this.ctx.font = "14px serif";
            this.ctx.fillText(this.isAxes ? label[i] : "", (clipSpace[0] *  0.5 + 0.5) * this.gl.canvas.width,
                (clipSpace[1] * -0.5 + 0.5) * this.gl.canvas.height);
        }
    }
    getRegion() {
        let minX = [this.tX(0, 0), this.tX(0, 1), this.mesh.feType === "fe2d3" ||
        this.mesh.feType === "fe2d4" ? 0.0 : this.tX(0, 2)];
        let maxX = [this.tX(0, 0), this.tX(0, 1), this.mesh.feType === "fe2d3" ||
        this.mesh.feType === "fe2d4" ? 0.0 : this.tX(0, 2)];
        for (let i = 1; i < this.mesh.x.length; i++) {
            for (let j = 0; j < this.mesh.x[i].length; j++) {
                if (this.tX(i, j) > maxX[j]) {
                    maxX[j] = this.tX(i, j);
                }
                if (this.tX(i, j) < minX[j]) {
                    minX[j] = this.tX(i, j);
                }
            }
        }
        this.radius = Math.sqrt(Math.pow(maxX[0] - minX[0], 2) + Math.pow(maxX[1] - minX[1], 2) +
            Math.pow(maxX[2] - minX[2], 2));
        this.xc = [(maxX[0] + minX[0]) * 0.5, (maxX[1] + minX[1]) * 0.5, (maxX[2] + minX[2]) * 0.5];
    }
    tX(i, j) {
        if (this.isTransformation) {
            return this.mesh.x[i][j] + this.transformation.ratio * this.radius *
                (this.mesh.func[this.transformation.index[j]].results[i] / this.maxTransformRatio);
        }
        return this.mesh.x[i][j];
    }
    resizeCanvasToDisplaySize(canvas, multiplier) {
        multiplier = multiplier || 1;
        const width = canvas.clientWidth * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

}

export let renderMesh = new RenderMesh();

