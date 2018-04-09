const variables = [
    {
        "name": "globalYaw",
        "min": -180,
        "max": 180,
        "val": 0
    }, {
        "name": "globalPitch",
        "min": -180,
        "max": 180,
        "val": 0
    }, {
        "name": "globalRoll",
        "min": -180,
        "max": 180,
        "val": 90
    }, {
        "name": "globalX",
        "min": -25,
        "max": 25,
        "val": 0
    }, {
        "name": "globalY",
        "min": -10,
        "max": 10,
        "val": 0
    }, {
        "name": "globalZ",
        "min": -20,
        "max": 20,
        "val": 0
    }, {
        "name": "headYaw",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "headPitch",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "headRoll",
        "min": -15,
        "max": 45,
        "val": 0
    }, {
        "name": "tailStartYaw",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "tailStartPitch",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "tailStartRoll",
        "min": -60,
        "max": 60,
        "val": 0
    }, {
        "name": "tailMidYaw",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "tailMidPitch",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "tailMidRoll",
        "min": -60,
        "max": 60,
        "val": 0
    }, {
        "name": "tailEndYaw",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "tailEndPitch",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "tailEndRoll",
        "min": -60,
        "max": 60,
        "val": 0
    }, {
        "name": "upperFrontLeftLegAngle",
        "min": 30,
        "max": 120,
        "val": 90
    }, {
        "name": "upperFrontRightLegAngle",
        "min": 30,
        "max": 120,
        "val": 90
    }, {
        "name": "upperBackLeftLegAngle",
        "min": 30,
        "max": 120,
        "val": 90
    }, {
        "name": "upperBackRightLegAngle",
        "min": 30,
        "max": 120,
        "val": 90
    }, {
        "name": "lowerFrontLeftLegAngle",
        "min": -60,
        "max": 30,
        "val": 0
    }, {
        "name": "lowerFrontRightLegAngle",
        "min": -60,
        "max": 30,
        "val": 0
    }, {
        "name": "lowerBackLeftLegAngle",
        "min": -30,
        "max": 90,
        "val": 0
    }, {
        "name": "lowerBackRightLegAngle",
        "min": -30,
        "max": 90,
        "val": 0
    }, {
        "name": "pawFrontLeftLegAngle",
        "min": -30,
        "max": 180,
        "val": 0
    }, {
        "name": "pawFrontRightLegAngle",
        "min": -30,
        "max": 180,
        "val": 0
    }, {
        "name": "pawBackLeftLegAngle",
        "min": -30,
        "max": 180,
        "val": 0
    }, {
        "name": "pawBackRightLegAngle",
        "min": -30,
        "max": 180,
        "val": 0
    }
];

const roomHeight = 20.0;
const roomWidth = 50.0;
let torsoHeight = 4.0;
let torsoWidth = 1.0;
const upperLegHeight = 1.;
const upperLegWidth = 0.5;
const lowerLegHeight = 1.0;
const lowerLegWidth = 0.5;
const pawLegHeight = 0.3;
const pawLegWidth = 0.75;
const headHeight = 1.5;
const headWidth = 1.0;
let tailHeight = 1.0;
const tailWidth = 0.5;

let cameraX = 0.0, cameraY = 0.0;

function createNode(transform, render, sibling, child) {
    return {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child
    };
}

function initNodes(key) {
    let m = mat4();

    switch (key) {
        case "room":
            m = translate(0.0, -0.5 * roomHeight, -0.6 * roomWidth);
            m = mult(m, rotate(cameraY, 1, 0, 0));
            m = mult(m, rotate(cameraX, 0, 1, 0));
            figure[key] = createNode(m, function () {
                instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * roomHeight, 0.0));
                instanceMatrix = mult(instanceMatrix, scale4(roomWidth, roomHeight, roomWidth));
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
                changeTexture("wall");
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
                gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
                gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
                gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);
                changeTexture("carpet");
                gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
                changeTexture("ceil");
                gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
                changeTexture("fur");
            }, null, "torso");
            break;
        case "torso":
            m = translate(jointVariables["globalX"], parseFloat(jointVariables["globalY"]) + 2, jointVariables["globalZ"]);
            m = mult(m, rotate(parseFloat(jointVariables["globalRoll"]), 1, 0, 0));
            m = mult(m, rotate(parseFloat(jointVariables["globalPitch"]), 0, 1, 0));
            m = mult(m, rotate(parseFloat(jointVariables["globalYaw"]), 0, 0, 1));
            m = mult(m, translate(-torsoWidth * 0.5, -torsoHeight * 0.5, -torsoWidth * 0.5));
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
            // noinspection JSSuspiciousNameCombination
            m = translate(-torsoWidth, upperLegWidth * 2, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            figure[key] = createNode(m, renderGenerator(upperLegHeight, upperLegWidth), "upperBackRightLeg", "lowerBackLeftLeg");
            break;
        case "upperBackRightLeg":
            // noinspection JSSuspiciousNameCombination
            m = translate(torsoWidth, upperLegWidth * 2, 0.0);
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
            m = mult(m, translate(0, 0, pawLegWidth / -2));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "pawFrontRightLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            m = mult(m, translate(0, 0, pawLegWidth / -2));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "pawBackLeftLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            m = mult(m, translate(0, 0, pawLegWidth / -2));
            figure[key] = createNode(m, renderGenerator(pawLegHeight, pawLegWidth), null, null);
            break;
        case "pawBackRightLeg":
            m = translate(0.0, lowerLegHeight * 1.1, 0.0);
            m = mult(m, rotate(jointVariables[key + "Angle"], 1, 0, 0));
            m = mult(m, translate(0, 0, pawLegWidth / -2));
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