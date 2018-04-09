const animator = document.getElementById("animator");
let editorKeyframe = 0;

function addKeyFrame() {
    if (playing)
        playing = false;
    const nof = document.createElement("div");
    nof.className = "noOfFrames";
    nof.innerHTML = '<input style="width:40px" size="3" value="10" type="number">';
    animator.appendChild(nof);
    const kf = document.createElement("div");
    kf.className = "keyframe";
    kf.innerHTML = '<button onclick="activateKeyframe(this)" class="loadKeyframe">KF</button><br><button onclick="deleteKeyframe(this)" class="deleteKeyframe">Delete</button>';
    animator.appendChild(kf);

    keyframes.push({});
    activateKeyframe(keyframes.length - 1);
    redoKeyframes();
}

function deleteKeyframe(keyframe) {
    const index = parseInt(keyframe.parentElement.firstElementChild.getAttribute("data-index"));
    const noOfFrames = document.getElementsByClassName("noOfFrames");
    animator.removeChild(keyframe.parentElement);
    animator.removeChild(noOfFrames[index]);
    keyframes.splice(index, 1);
    redoKeyframes();
    if (index === editorKeyframe)
        activateKeyframe(index % keyframes.length, true);
}

function redoKeyframes() {
    const kfs = document.getElementsByClassName("loadKeyframe");
    for (let i = 0; i < kfs.length; i++) {
        kfs[i].innerText = "KF " + (i + 1);
        kfs[i].setAttribute("data-index", i.toString());
    }
    if (kfs.length === 1) {
        kfs[0].parentNode.lastChild.disabled = true;
    } else { // noinspection Annotator
        if (kfs[0].parentNode.lastChild.disabled) {
            kfs[0].parentNode.lastChild.disabled = false;
        }
    }

    updateInBetweenFrameCount();
}

function filterVariables() {
    const box = document.getElementById("filter");
    const value = box.value;
    box.value = "";
    const variables = document.getElementsByClassName("variable");
    for (let i = 0; i < variables.length; i++) {
        variables[i].hidden = variables[i].innerText.toLowerCase().indexOf(value.toLowerCase()) < 0;
    }

    return false;
}

function generateVariables() {
    const wrapper = document.getElementById("variables");
    for (let i = 0; i < variables.length; i++) {
        const obj = variables[i];

        const inject = document.createElement("li");
        inject.className = "variable";
        const slider = document.createElement("input");
        const span = document.createElement("span");

        slider.type = "range";
        slider.min = obj.min;
        slider.max = obj.max.toString();
        slider.value = obj.val.toString();
        slider.name = obj.name;
        slider.step = "0.1";
        slider.oninput = updateSliderIndicator(slider, span);
        slider.className = "slider";

        span.innerText = slider.value;

        jointVariables[slider.name] = slider.value;

        inject.appendChild(document.createTextNode(obj.name + ": " + obj.min));
        inject.appendChild(slider);
        inject.appendChild(document.createTextNode(obj.max + " Current: "));
        inject.appendChild(span);

        wrapper.appendChild(inject);
    }
}

function loadVariablesFromKeyframes(index) {
    for (const key of Object.keys(jointVariables)) {
        if (key in keyframes[index]) {
            const slider = document.getElementsByName(key)[0];
            slider.parentElement.lastElementChild.innerHTML = keyframes[index][key];
            slider.value = keyframes[index][key];
            jointVariables[key] = keyframes[index][key];
        }
    }
    requestAnimationFrame(render);
}

function saveVariablesToKeyframes(index) {
    const sliders = document.getElementsByClassName("slider");
    for (let i = 0; i < sliders.length; i++) {
        keyframes[index][sliders[i].name] = sliders[i].value;
    }
}

function updateSliderIndicator(slider, span) {
    return function () {
        if (playing)
            playing = false;
        span.innerText = slider.value;
        jointVariables[slider.name] = slider.value;
        requestAnimationFrame(render);
    }
}

function activateKeyframe(index, deleting) {
    if (typeof index !== "number")
        index = index.getAttribute("data-index");
    if (playing)
        playStop();
    if (!playing && !deleting)
        saveVariablesToKeyframes(editorKeyframe);
    loadVariablesFromKeyframes(index);

    const keyframeButtons = document.getElementsByClassName("loadKeyframe");
    try {
        keyframeButtons[editorKeyframe].disabled = false;
    } catch (err) {
    }
    keyframeButtons[index].disabled = true;
    editorKeyframe = index;
}

function updateInBetweenFrameCount() {
    const nof = document.getElementsByClassName("noOfFrames");

    inBetweenFrameCount = [];
    for (let i = 0; i < nof.length; i++) {
        inBetweenFrameCount.push(parseInt(nof[i].firstChild.value));
    }
}

function playStop() {
    playing = !playing;
    if (playing) {
        saveVariablesToKeyframes(editorKeyframe);
        updateInBetweenFrameCount();
        currentKeyframe = 0;
        frameCount = 0;
        animate();
    }
}

function saveAnimation() {
    saveVariablesToKeyframes(editorKeyframe);

    let link = document.createElement("a");
    link.href = 'data:application/octet-stream,'
        + encodeURIComponent(JSON.stringify(
            {
                "keyframes": keyframes,
                "inBetweenFrameCount": inBetweenFrameCount
            }
        ));

    link.download = "animation" + (new Date()).getTime() + ".json";
    link.click();
}

function saveCurrentKeyframes() {
    saveVariablesToKeyframes(editorKeyframe);

    let link = document.createElement("a");
    link.href = 'data:application/octet-stream,'
        + encodeURIComponent(JSON.stringify(
            keyframes[editorKeyframe]
        ));

    link.download = "keyframe" + (new Date()).getTime() + ".json";
    link.click();
}

function loadAnimation(evt) {
    const file = evt.target.files[0];
    const fr = new FileReader();

    fr.onload = function (e) {
        loadFromText(e.target.result);
    };

    fr.readAsText(file);
}

function loadFromText(text) {
    const data = JSON.parse(text);
    while (data["keyframes"].length < keyframes.length) {
        deleteKeyframe(0);
    }
    while (data["keyframes"].length > keyframes.length) {
        addKeyFrame();
    }
    keyframes = data["keyframes"];
    inBetweenFrameCount = data["inBetweenFrameCount"];
    let textboxes = document.getElementsByClassName("noOfFrames");

    for (let i = 0; i < inBetweenFrameCount.length; i++) {
        textboxes[i].firstChild.value = inBetweenFrameCount[i];
        console.log(inBetweenFrameCount[i]);
    }

    loadVariablesFromKeyframes(editorKeyframe);

    requestAnimationFrame(render)
}

function loadRun() {
    loadFromText('{"keyframes":[{"globalYaw":"0","globalPitch":"0","globalRoll":"82.3","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"12.5","tailStartYaw":"0","tailStartPitch":"30","tailStartRoll":"-23.2","tailMidYaw":"0","tailMidPitch":"-30","tailMidRoll":"15.4","tailEndYaw":"0","tailEndPitch":"30","tailEndRoll":"21.5","upperFrontLeftLegAngle":"120","upperFrontRightLegAngle":"116.2","upperBackLeftLegAngle":"60","upperBackRightLegAngle":"60.1","lowerFrontLeftLegAngle":"30","lowerFrontRightLegAngle":"30","lowerBackLeftLegAngle":"60","lowerBackRightLegAngle":"60","pawFrontLeftLegAngle":"121.1","pawFrontRightLegAngle":"120.5","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"-0.3","globalRoll":"81.3","globalX":"0","globalY":"0.5","globalZ":"0","headYaw":"-1.7","headPitch":"-1.6","headRoll":"9.4","tailStartYaw":"0","tailStartPitch":"30","tailStartRoll":"-8.5","tailMidYaw":"0","tailMidPitch":"-30","tailMidRoll":"-2.5","tailEndYaw":"0","tailEndPitch":"30","tailEndRoll":"21.5","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"120","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-30","lowerFrontRightLegAngle":"-19.2","lowerBackLeftLegAngle":"30","lowerBackRightLegAngle":"30","pawFrontLeftLegAngle":"180","pawFrontRightLegAngle":"88.4","pawBackLeftLegAngle":"88.6","pawBackRightLegAngle":"88.9"},{"globalYaw":"0","globalPitch":"-0.3","globalRoll":"100.4","globalX":"0","globalY":"0.2","globalZ":"0","headYaw":"-1.7","headPitch":"-1.6","headRoll":"-15","tailStartYaw":"0","tailStartPitch":"30","tailStartRoll":"4.5","tailMidYaw":"0","tailMidPitch":"-30","tailMidRoll":"-14.3","tailEndYaw":"0","tailEndPitch":"30","tailEndRoll":"-24.8","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"116","upperBackLeftLegAngle":"60","upperBackRightLegAngle":"89.5","lowerFrontLeftLegAngle":"-30","lowerFrontRightLegAngle":"-19.2","lowerBackLeftLegAngle":"60","lowerBackRightLegAngle":"60","pawFrontLeftLegAngle":"69.6","pawFrontRightLegAngle":"-12.7","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"}],"inBetweenFrameCount":[10,15,15]}')
}

function loadKeyframe(evt) {
    const file = evt.target.files[0];
    const fr = new FileReader();

    fr.onload = function (e) {
        const data = JSON.parse(e.target.result);
        keyframes[editorKeyframe] = data;
        loadVariablesFromKeyframes(editorKeyframe);

        requestAnimationFrame(render)
    };

    fr.readAsText(file);
}

addKeyFrame();
generateVariables();
const c = document.getElementById("gl-canvas");
c.width = c.parentElement.clientWidth;
c.height = c.parentElement.clientHeight;

document.getElementById('fileAnimation').addEventListener('change', loadAnimation, false);
document.getElementById('fileKeyframe').addEventListener('change', loadKeyframe, false);

let prevX, prevY, lastUpdate = 0;

function camera(event) {
    if (Date.now() - lastUpdate > spf) {
        const deltaX = (event.clientX - prevX) / c.width;
        const deltaY = (event.clientY - prevY) / c.height;

        cameraX += -1 * deltaX * 180;
        cameraY += deltaY * 180;

        prevX = event.clientX;
        prevY = event.clientY;

        if (!playing)
            requestAnimFrame(render);
        lastUpdate = Date.now();
    }
}

c.addEventListener("mousedown", function (event) {
    prevX = event.clientX;
    prevY = event.clientY;

    c.addEventListener("mousemove", camera)
});

function finish() {
    c.removeEventListener("mousemove", camera);
    if (!playing)
        requestAnimFrame(render);
}

c.addEventListener("mouseup", finish);
c.addEventListener("mouseleave", finish);