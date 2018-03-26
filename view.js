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

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 0.8, 0.0, 1.0 ),  // green
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 )  // white
];

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperLegHeight = 1.;
var upperLegWidth = 0.5;
var lowerLegHeight = 1.0;
var lowerLegWidth = 0.5;
var pawLegHeight = 0.3;
var pawLegWidth = 0.75;
var headHeight = 1.5;
var headWidth = 1.0;
var tailHeight = 1.0;
var tailWidth = 0.5;

var jointVariables = {};
var figure = {
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

var stack = [];
var vBuffer, cBuffer;
var pointsArray = [], colorsArray = [];

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
            m = translate(jointVariables["globalX"], jointVariables["globalY"], jointVariables["globalZ"]-20);
            m = mult(m, rotate(jointVariables["globalRoll"], 1, 0, 0));
            m = mult(m, rotate(jointVariables["globalPitch"], 0, 1, 0));
            m = mult(m, rotate(jointVariables["globalYaw"] - 90, 0, 0, 1));
            m = mult(m, translate(-torsoWidth*0.5, -torsoHeight*0.5, -torsoWidth*0.5));
            figure[key] = createNode(m, renderGenerator(torsoHeight, torsoWidth), null, "head");
            break;
        case "head":
            m = translate(0.0, torsoHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables["headRoll"], 1, 0, 0));
            m = mult(m, rotate(jointVariables["headPitch"], 0, 1, 0));
            m = mult(m, rotate(jointVariables["headYaw"], 0, 0, 1));
            figure["head"] = createNode(m, renderGenerator(headHeight, headWidth), "upperFrontLeftLeg", null);
            break;
        case "upperFrontLeftLeg":
            m = translate(-torsoWidth, torsoHeight - upperLegWidth, 0.0);
            m = mult(m, rotate(jointVariables["upperFrontLeftLegAngle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(upperLegHeight, upperLegWidth), "upperFrontRightLeg", "lowerFrontLeftLeg");
            break;
        case "upperFrontRightLeg":
            m = translate(torsoWidth, torsoHeight - upperLegWidth, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(upperLegHeight, upperLegWidth), "upperBackLeftLeg", "lowerFrontRightLeg");
            break;
        case "upperBackLeftLeg":
            m = translate(-torsoWidth, upperLegWidth, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(upperLegHeight, upperLegWidth), "upperBackRightLeg", "lowerBackLeftLeg");
            break;
        case "upperBackRightLeg":
            m = translate(torsoWidth, upperLegWidth, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(upperLegHeight, upperLegWidth), "tailStart", "lowerBackRightLeg");
            break;
        case "lowerFrontLeftLeg":
            m = translate(0.0, upperLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(lowerLegHeight, lowerLegWidth), null, "pawFrontLeftLeg");
            break;
        case "lowerFrontRightLeg":
            m = translate(0.0, upperLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(lowerLegHeight, lowerLegWidth), null, "pawFrontRightLeg");
            break;
        case "lowerBackLeftLeg":
            m = translate(0.0, upperLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(lowerLegHeight, lowerLegWidth), null, "pawBackLeftLeg");
            break;
        case "lowerBackRightLeg":
            m = translate(0.0, upperLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(lowerLegHeight, lowerLegWidth), null, "pawBackRightLeg");
            break;
        case "pawFrontLeftLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "pawFrontRightLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "pawBackLeftLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "pawBackRightLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "tailStart":
            m = rotate(jointVariables[key + "Roll"], 1, 0, 0);
            m = mult(m, rotate(jointVariables[key + "Pitch"], 0, 1, 0));
            m = mult(m, rotate((jointVariables[key + "Yaw"]), 0, 0, 1));
            m = mult(m, translate(0.0, -tailHeight * 1.1, 0.0));
            figure[key] = createNode(m, renderGenerator(tailHeight, tailWidth), null, "tailMid");
            break;
        case "tailMid":
            m = rotate(jointVariables[key + "Roll"], 1, 0, 0);
            m = mult(m, rotate(jointVariables[key + "Pitch"], 0, 1, 0));
            m = mult(m, rotate((jointVariables[key + "Yaw"]), 0, 0, 1));
            m = mult(m, translate(0.0, -tailHeight * 1.1, 0.0));
            figure[key] = createNode(m, renderGenerator(tailHeight, tailWidth), null, "tailEnd");
            break;
        case "tailEnd":
            m = rotate(jointVariables[key + "Roll"], 1, 0, 0);
            m = mult(m, rotate(jointVariables[key + "Pitch"], 0, 1, 0));
            m = mult(m, rotate((jointVariables[key + "Yaw"]), 0, 0, 1));
            m = mult(m, translate(0.0, -tailHeight * 1.1, 0.0));
            figure[key] = createNode(m, renderGenerator(tailHeight, tailWidth), null, null);
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

function renderGenerator(height, width) {
    return function () {
        instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * height, 0.0));
        instanceMatrix = mult(instanceMatrix, scale4(width, height, width));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);

    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
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

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = perspective(45., (1. * canvas.clientWidth) / canvas.clientHeight, 10, 100.);
    //projectionMatrix = ortho(-10.0, 10.0, -10.0 * (canvas.clientHeight / canvas.clientWidth), 10.0 * (canvas.clientHeight / canvas.clientWidth), -10.0, 10.0);

    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

var render = function () {
    for (var key in figure) {
        initNodes(key);
    }

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    traverse("torso");
};