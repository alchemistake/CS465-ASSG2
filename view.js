// This file was based on the man example of the book but heavily edited
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

// Textures are hold here to have access from multiple scripts
let textures = {
    "fur": null,
    "wall": null,
    "carpet": null,
    "ceil": null
};

// Vertices of cube
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

// Figure and Joint variables are converted to objects for ease of use
// And there is added figure parts and joints
const jointVariables = {};
const figure = {
    "room": null,
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

// Traverses the hierarchy tree
function traverse(key) {
    if (key == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[key].transform);
    figure[key].render();
    if (figure[key].child != null) traverse(figure[key].child);
    modelViewMatrix = stack.pop();
    if (figure[key].sibling != null) traverse(figure[key].sibling);
}

// A function creator for each part of figure to reduce the code clutter.
function renderGenerator(height, width) {
    return function () {
        instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * height, 0.0));
        instanceMatrix = mult(instanceMatrix, scale4(width, height, width));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
        for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

// Quad function is updated to accommodate for the texture locations
function quad(a, b, c, d,) {
    pointsArray.push([...vertices[a], 1.5, 1.5]);
    pointsArray.push([...vertices[b], 1.5, -1.5]);
    pointsArray.push([...vertices[c], -1.5, -1.5]);
    pointsArray.push([...vertices[d], -1.5, 1.5]);
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
    // Depth test was not enable in the original
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    // Create the texture for later use
    generateTexture("fur");
    generateTexture("wall");
    generateTexture("carpet");
    generateTexture("ceil");

    gl.useProgram(program);

    instanceMatrix = mat4();

    // Projection is changed to perspective for more realistic look
    projectionMatrix = perspective(45., (1. * canvas.clientWidth) / canvas.clientHeight, 10, 100.);

    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    const vTexPosition = gl.getAttribLocation(program, 'vTexPosition');

    // Code for enabling x,y,z, u and v coordinates
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(vTexPosition, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vTexPosition);

    gl.activeTexture(gl.TEXTURE0);
    changeTexture("fur");

    render();
};

// Applies the updates in joint variables as transformations and renders the new position
function render() {
    for (let key in figure) {
        initNodes(key);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    traverse("room");
}

// Creates texture object
function generateTexture(textureName) {
    textures[textureName] = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, textures[textureName]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById(textureName));
}

// Wrapper for gl.bindtexture function to increase ease of use
function changeTexture(name) {
    gl.bindTexture(gl.TEXTURE_2D, textures[name]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
}