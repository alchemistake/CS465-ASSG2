function scale4(a, b, c) {
    const result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

let canvas;
let gl;
let program;

let projectionMatrix;
let modelViewMatrix;

let instanceMatrix;
let modelViewMatrixLoc;

const vertices = [
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5],
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, -0.5]
];

const jointVariables = {};
const figure = {
    "global": null,
    "torso": null,
    "head": null,
    "tailStart": null,
    "tailMid": null,
    "tailEnd": null,
    "upperFrontLeftLeg": null,
    "upperFrontRightLeg": null,
    "upperBackLeftLeg": null,
    "upperBackRightLeg": null,
    "lowerFrontLeftLeg": null,
    "lowerFrontRightLeg": null,
    "lowerBackLeftLeg": null,
    "lowerBackRightLeg": null,
    "pawFrontLeftLeg": null,
    "pawFrontRightLeg": null,
    "pawBackLeftLeg": null,
    "pawBackRightLeg": null
};

const stack = [];
let vBuffer;
const pointsArray = [];

function traverse(key) {
    if (key == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[key].transform);
    figure[key].render();
    if (figure[key].child != null) traverse(figure[key].child);
    modelViewMatrix = stack.pop();
    if (figure[key].sibling != null) traverse(figure[key].sibling);
}

function renderGenerator(height, width) {
    return function () {
        instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * height, 0.0));
        instanceMatrix = mult(instanceMatrix, scale4(width, height, width));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
        for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function quad(a, b, c, d) {
    pointsArray.push([...vertices[a], 0.0, 0.0]);
    pointsArray.push([...vertices[b], 0.0, 1.0]);
    pointsArray.push([...vertices[c], 1.0, 1.0]);
    pointsArray.push([...vertices[d], 1.0, 0.0]);
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.5, .5, .5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    const boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('crate-image')
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = perspective(45., (1. * canvas.clientWidth) / canvas.clientHeight, 10, 100.);
    //projectionMatrix = ortho(-10.0, 10.0, -10.0 * (canvas.clientHeight / canvas.clientWidth), 10.0 * (canvas.clientHeight / canvas.clientWidth), -10.0, 10.0);

    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    // cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    //
    // const vColor = gl.getAttribLocation(program, "vColor");
    // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    // gl.vertexAttribPointer(vPosition, 5, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vPosition);

    const texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

    gl.vertexAttribPointer(
        vPosition, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        texCoordAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    render();
};

function render() {
    for (let key in figure) {
        initNodes(key);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    traverse("torso");
}