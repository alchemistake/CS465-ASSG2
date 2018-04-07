/*
http://learningwebgl.com/blog/?p=1658
 */

var catvPosBuffer;
var catvNormBuffer;
var catvTexCoordBuffer;
var catvIndexBuffer;

/*

function loadtheMeow() {
    var request = new XMLHttpRequest();
    request.open("GET", "catcorrect.json");
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            handletheMeow(JSON.parse(request.responseText));
        }
    }
    request.send();
}

*/
var catmodel = JSON.parse("correctcat.json");

function handletheMeow(catmodel) {
    catvNormBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, catvNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(catmodel.vertexNormals), gl.STATIC_DRAW);
    catvNormBuffer.itemSize = 3;
    catvNormBuffer.numItems = catmodel.vertexNormals.length / 3;

    catvTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, catvTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(catmodel.vertexTextureCoords), gl.STATIC_DRAW);
    catvTexCoordBuffer.itemSize = 2;
    catvTexCoordBuffer.numItems = catmodel.vertexTextureCoords.length / 2;

    catvPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, catvPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(catmodel.vertexPositions), gl.STATIC_DRAW);
    catvPosBuffer.itemSize = 3;
    catvPosBuffer.numItems = catmodel.vertexPositions.length / 3;

    catvIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, catvIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(catmodel.indices), gl.STATIC_DRAW);
    catvIndexBuffer.itemSize = 1;
    catvIndexBuffer.numItems = catmodel.indices.length;

}

gl.bindBuffer(gl.ARRAY_BUFFER, catvPosBuffer);
gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, catvPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, catvTexCoordBuffer);
gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, catvTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, catvNormBuffer);
gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, catvNormBuffer.itemSize, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, catvIndexBuffer);
gl.drawElements(gl.TRIANGLES, catvIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);