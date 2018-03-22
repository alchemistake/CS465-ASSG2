function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;



var theta = {
    "torso": 0,
    "head": 0,
    "head1": 0,
    "head2": 0,
    "leftUpperArm": 0,
    "leftLowerArm": 0,
    "rightUpperArm": 0,
    "rightLowerArm": 0,
    "leftUpperLeg": 0,
    "leftLowerLeg": 0,
    "rightUpperLeg": 0,
    "rightLowerLeg": 0
};

var figure = {
    "torso": null,
    "head": null,
    "head1": null,
    "head2": null,
    "leftUpperArm": null,
    "leftLowerArm": null,
    "rightUpperArm": null,
    "rightLowerArm": null,
    "leftUpperLeg": null,
    "leftLowerLeg": null,
    "rightUpperLeg": null,
    "rightLowerLeg": null
};

var stack = [];

var vBuffer;

var pointsArray = [];


function createNode(transform, render, sibling, child) {
    return {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child
    };
}


function initNodes(key) {

    var m = mat4();

    switch (key) {
        case "torso":
            m = rotate(theta[key], 0, 1, 0);
            figure[key] = createNode(m, torso, null, "head");
            break;

        case "head":
        case "head1":
        case "head2":
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta["head1"], 1, 0, 0));
            m = mult(m, rotate(theta["head2"], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure["head"] = createNode(m, head, "leftUpperArm", null);
            break;

        case "leftUpperArm":
            m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, leftUpperArm, "rightUpperArm", "leftLowerArm");
            break;

        case "rightUpperArm":
            m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, rightUpperArm, "leftUpperLeg", "rightLowerArm");
            break;

        case "leftUpperLeg":
            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, leftUpperLeg, "rightUpperLeg", "leftLowerLeg");
            break;

        case "rightUpperLeg":
            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, rightUpperLeg, null, "rightLowerLeg");
            break;

        case "leftLowerArm":
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, leftLowerArm, null, null);
            break;

        case "rightLowerArm":
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, rightLowerArm, null, null);
            break;

        case "leftLowerLeg":
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, leftLowerLeg, null, null);
            break;

        case "rightLowerLeg":
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[key], 1, 0, 0));
            figure[key] = createNode(m, rightLowerLeg, null, null);
            break;
    }
}

function traverse(key) {

    if (key == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[key].transform);
    figure[key].render();
    if (figure[key].child != null) traverse(figure[key].child);
    modelViewMatrix = stack.pop();
    if (figure[key].sibling != null) traverse(figure[key].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
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

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    for (var key in theta) {
        initNodes(key);
    }

    render();
};

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT);
    traverse("torso");
};