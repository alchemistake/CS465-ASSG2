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

    if (0 === editorKeyframe)
        activateKeyframe(editorKeyframe, true);
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
        deleteKeyframe(document.getElementsByClassName("deleteKeyframe")[0]);
    }
    while (data["keyframes"].length > keyframes.length) {
        addKeyFrame();
    }
    keyframes = data["keyframes"];
    inBetweenFrameCount = data["inBetweenFrameCount"];
    let textboxes = document.getElementsByClassName("noOfFrames");

    for (let i = 0; i < inBetweenFrameCount.length; i++) {
        textboxes[i].firstChild.value = inBetweenFrameCount[i];
    }

    editorKeyframe = 0;
    loadVariablesFromKeyframes(editorKeyframe);

    requestAnimationFrame(render)
}

function loadRun() {
    loadFromText('{\n' +
        '    "keyframes":\n' +
        '        [{\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "-20",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "-18",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "-16",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "-14",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "-12",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "-10",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "-8",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "-6",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "-4",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "-2",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "0",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "2",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "4",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "6",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "8",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "10",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "12",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "14",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "0",\n' +
        '            "globalRoll": "82.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0",\n' +
        '            "globalZ": "16",\n' +
        '            "headYaw": "0",\n' +
        '            "headPitch": "0",\n' +
        '            "headRoll": "12.5",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-23.2",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "15.4",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "120",\n' +
        '            "upperFrontRightLegAngle": "116.2",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "60.1",\n' +
        '            "lowerFrontLeftLegAngle": "30",\n' +
        '            "lowerFrontRightLegAngle": "30",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "121.1",\n' +
        '            "pawFrontRightLegAngle": "120.5",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "81.3",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.5",\n' +
        '            "globalZ": "18",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "9.4",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "-8.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-2.5",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "21.5",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "60",\n' +
        '            "upperBackLeftLegAngle": "120",\n' +
        '            "upperBackRightLegAngle": "120",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "30",\n' +
        '            "lowerBackRightLegAngle": "30",\n' +
        '            "pawFrontLeftLegAngle": "180",\n' +
        '            "pawFrontRightLegAngle": "88.4",\n' +
        '            "pawBackLeftLegAngle": "88.6",\n' +
        '            "pawBackRightLegAngle": "88.9"\n' +
        '        }, {\n' +
        '            "globalYaw": "0",\n' +
        '            "globalPitch": "-0.3",\n' +
        '            "globalRoll": "100.4",\n' +
        '            "globalX": "0",\n' +
        '            "globalY": "0.2",\n' +
        '            "globalZ": "20",\n' +
        '            "headYaw": "-1.7",\n' +
        '            "headPitch": "-1.6",\n' +
        '            "headRoll": "-15",\n' +
        '            "tailStartYaw": "0",\n' +
        '            "tailStartPitch": "30",\n' +
        '            "tailStartRoll": "4.5",\n' +
        '            "tailMidYaw": "0",\n' +
        '            "tailMidPitch": "-30",\n' +
        '            "tailMidRoll": "-14.3",\n' +
        '            "tailEndYaw": "0",\n' +
        '            "tailEndPitch": "30",\n' +
        '            "tailEndRoll": "-24.8",\n' +
        '            "upperFrontLeftLegAngle": "60",\n' +
        '            "upperFrontRightLegAngle": "116",\n' +
        '            "upperBackLeftLegAngle": "60",\n' +
        '            "upperBackRightLegAngle": "89.5",\n' +
        '            "lowerFrontLeftLegAngle": "-30",\n' +
        '            "lowerFrontRightLegAngle": "-19.2",\n' +
        '            "lowerBackLeftLegAngle": "60",\n' +
        '            "lowerBackRightLegAngle": "60",\n' +
        '            "pawFrontLeftLegAngle": "69.6",\n' +
        '            "pawFrontRightLegAngle": "-12.7",\n' +
        '            "pawBackLeftLegAngle": "-30",\n' +
        '            "pawBackRightLegAngle": "-30"\n' +
        '        }], "inBetweenFrameCount":\n' +
        '        [0, 15, 15, 10, 15, 15, 10, 15, 15, 10, 15, 15, 10, 15, 15, 10, 15, 15, 10, 15, 15]\n' +
        '}')
}

function loadWalk() {
    loadFromText('{\n' +
        '    "keyframes": [{\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-20",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "23.8",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "70.3",\n' +
        '        "upperFrontRightLegAngle": "113.8",\n' +
        '        "upperBackLeftLegAngle": "105.1",\n' +
        '        "upperBackRightLegAngle": "73.8",\n' +
        '        "lowerFrontLeftLegAngle": "8.1",\n' +
        '        "lowerFrontRightLegAngle": "-9.4",\n' +
        '        "lowerBackLeftLegAngle": "-12.7",\n' +
        '        "lowerBackRightLegAngle": "-29.8",\n' +
        '        "pawFrontLeftLegAngle": "22.2",\n' +
        '        "pawFrontRightLegAngle": "0.1",\n' +
        '        "pawBackLeftLegAngle": "6.6",\n' +
        '        "pawBackRightLegAngle": "90.5"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-18",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "35.7",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "114.5",\n' +
        '        "upperFrontRightLegAngle": "64.3",\n' +
        '        "upperBackLeftLegAngle": "120",\n' +
        '        "upperBackRightLegAngle": "85.4",\n' +
        '        "lowerFrontLeftLegAngle": "-30.6",\n' +
        '        "lowerFrontRightLegAngle": "-60",\n' +
        '        "lowerBackLeftLegAngle": "-6.6",\n' +
        '        "lowerBackRightLegAngle": "-30",\n' +
        '        "pawFrontLeftLegAngle": "17.9",\n' +
        '        "pawFrontRightLegAngle": "180",\n' +
        '        "pawBackLeftLegAngle": "-8.1",\n' +
        '        "pawBackRightLegAngle": "41.3"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-16",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "-30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "120",\n' +
        '        "upperFrontRightLegAngle": "60",\n' +
        '        "upperBackLeftLegAngle": "120",\n' +
        '        "upperBackRightLegAngle": "97.2",\n' +
        '        "lowerFrontLeftLegAngle": "9",\n' +
        '        "lowerFrontRightLegAngle": "-32.2",\n' +
        '        "lowerBackLeftLegAngle": "43.2",\n' +
        '        "lowerBackRightLegAngle": "-13.6",\n' +
        '        "pawFrontLeftLegAngle": "-30",\n' +
        '        "pawFrontRightLegAngle": "130.9",\n' +
        '        "pawBackLeftLegAngle": "71",\n' +
        '        "pawBackRightLegAngle": "1.5"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-14",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "-9.7",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "108.1",\n' +
        '        "upperFrontRightLegAngle": "68.7",\n' +
        '        "upperBackLeftLegAngle": "78.7",\n' +
        '        "upperBackRightLegAngle": "112.2",\n' +
        '        "lowerFrontLeftLegAngle": "24.5",\n' +
        '        "lowerFrontRightLegAngle": "-22.4",\n' +
        '        "lowerBackLeftLegAngle": "-30",\n' +
        '        "lowerBackRightLegAngle": "-30",\n' +
        '        "pawFrontLeftLegAngle": "48.4",\n' +
        '        "pawFrontRightLegAngle": "67.9",\n' +
        '        "pawBackLeftLegAngle": "180",\n' +
        '        "pawBackRightLegAngle": "16.1"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-12",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "-9.8",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "-30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "101.3",\n' +
        '        "upperFrontRightLegAngle": "72.6",\n' +
        '        "upperBackLeftLegAngle": "74",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-36.8",\n' +
        '        "lowerFrontRightLegAngle": "-20.9",\n' +
        '        "lowerBackLeftLegAngle": "-27.8",\n' +
        '        "lowerBackRightLegAngle": "-13.4",\n' +
        '        "pawFrontLeftLegAngle": "180",\n' +
        '        "pawFrontRightLegAngle": "67.9",\n' +
        '        "pawBackLeftLegAngle": "104.2",\n' +
        '        "pawBackRightLegAngle": "4.2"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-10",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "13.9",\n' +
        '        "upperFrontLeftLegAngle": "83",\n' +
        '        "upperFrontRightLegAngle": "101.1",\n' +
        '        "upperBackLeftLegAngle": "79.9",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-60",\n' +
        '        "lowerFrontRightLegAngle": "-20.9",\n' +
        '        "lowerBackLeftLegAngle": "-27.8",\n' +
        '        "lowerBackRightLegAngle": "8.8",\n' +
        '        "pawFrontLeftLegAngle": "180",\n' +
        '        "pawFrontRightLegAngle": "23",\n' +
        '        "pawBackLeftLegAngle": "57.2",\n' +
        '        "pawBackRightLegAngle": "-10.1"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-8",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "60",\n' +
        '        "upperFrontLeftLegAngle": "60",\n' +
        '        "upperFrontRightLegAngle": "120",\n' +
        '        "upperBackLeftLegAngle": "100.1",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-27.8",\n' +
        '        "lowerFrontRightLegAngle": "-5.8",\n' +
        '        "lowerBackLeftLegAngle": "-30",\n' +
        '        "lowerBackRightLegAngle": "43.9",\n' +
        '        "pawFrontLeftLegAngle": "136.3",\n' +
        '        "pawFrontRightLegAngle": "0.3",\n' +
        '        "pawBackLeftLegAngle": "24.9",\n' +
        '        "pawBackRightLegAngle": "64.9"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-6",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "23.8",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "70.3",\n' +
        '        "upperFrontRightLegAngle": "113.8",\n' +
        '        "upperBackLeftLegAngle": "105.1",\n' +
        '        "upperBackRightLegAngle": "73.8",\n' +
        '        "lowerFrontLeftLegAngle": "8.1",\n' +
        '        "lowerFrontRightLegAngle": "-9.4",\n' +
        '        "lowerBackLeftLegAngle": "-12.7",\n' +
        '        "lowerBackRightLegAngle": "-29.8",\n' +
        '        "pawFrontLeftLegAngle": "22.2",\n' +
        '        "pawFrontRightLegAngle": "0.1",\n' +
        '        "pawBackLeftLegAngle": "6.6",\n' +
        '        "pawBackRightLegAngle": "90.5"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-4",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "35.7",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "114.5",\n' +
        '        "upperFrontRightLegAngle": "64.3",\n' +
        '        "upperBackLeftLegAngle": "120",\n' +
        '        "upperBackRightLegAngle": "85.4",\n' +
        '        "lowerFrontLeftLegAngle": "-30.6",\n' +
        '        "lowerFrontRightLegAngle": "-60",\n' +
        '        "lowerBackLeftLegAngle": "-6.6",\n' +
        '        "lowerBackRightLegAngle": "-30",\n' +
        '        "pawFrontLeftLegAngle": "17.9",\n' +
        '        "pawFrontRightLegAngle": "180",\n' +
        '        "pawBackLeftLegAngle": "-8.1",\n' +
        '        "pawBackRightLegAngle": "41.3"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "-2",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "-30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "120",\n' +
        '        "upperFrontRightLegAngle": "60",\n' +
        '        "upperBackLeftLegAngle": "120",\n' +
        '        "upperBackRightLegAngle": "97.2",\n' +
        '        "lowerFrontLeftLegAngle": "9",\n' +
        '        "lowerFrontRightLegAngle": "-32.2",\n' +
        '        "lowerBackLeftLegAngle": "43.2",\n' +
        '        "lowerBackRightLegAngle": "-13.6",\n' +
        '        "pawFrontLeftLegAngle": "-30",\n' +
        '        "pawFrontRightLegAngle": "130.9",\n' +
        '        "pawBackLeftLegAngle": "71",\n' +
        '        "pawBackRightLegAngle": "1.5"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "0",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "-9.7",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "108.1",\n' +
        '        "upperFrontRightLegAngle": "68.7",\n' +
        '        "upperBackLeftLegAngle": "78.7",\n' +
        '        "upperBackRightLegAngle": "112.2",\n' +
        '        "lowerFrontLeftLegAngle": "24.5",\n' +
        '        "lowerFrontRightLegAngle": "-22.4",\n' +
        '        "lowerBackLeftLegAngle": "-30",\n' +
        '        "lowerBackRightLegAngle": "-30",\n' +
        '        "pawFrontLeftLegAngle": "48.4",\n' +
        '        "pawFrontRightLegAngle": "67.9",\n' +
        '        "pawBackLeftLegAngle": "180",\n' +
        '        "pawBackRightLegAngle": "16.1"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "2",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "-9.8",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "-30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "101.3",\n' +
        '        "upperFrontRightLegAngle": "72.6",\n' +
        '        "upperBackLeftLegAngle": "74",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-36.8",\n' +
        '        "lowerFrontRightLegAngle": "-20.9",\n' +
        '        "lowerBackLeftLegAngle": "-27.8",\n' +
        '        "lowerBackRightLegAngle": "-13.4",\n' +
        '        "pawFrontLeftLegAngle": "180",\n' +
        '        "pawFrontRightLegAngle": "67.9",\n' +
        '        "pawBackLeftLegAngle": "104.2",\n' +
        '        "pawBackRightLegAngle": "4.2"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "4",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "13.9",\n' +
        '        "upperFrontLeftLegAngle": "83",\n' +
        '        "upperFrontRightLegAngle": "101.1",\n' +
        '        "upperBackLeftLegAngle": "79.9",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-60",\n' +
        '        "lowerFrontRightLegAngle": "-20.9",\n' +
        '        "lowerBackLeftLegAngle": "-27.8",\n' +
        '        "lowerBackRightLegAngle": "8.8",\n' +
        '        "pawFrontLeftLegAngle": "180",\n' +
        '        "pawFrontRightLegAngle": "23",\n' +
        '        "pawBackLeftLegAngle": "57.2",\n' +
        '        "pawBackRightLegAngle": "-10.1"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "6",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "60",\n' +
        '        "upperFrontLeftLegAngle": "60",\n' +
        '        "upperFrontRightLegAngle": "120",\n' +
        '        "upperBackLeftLegAngle": "100.1",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-27.8",\n' +
        '        "lowerFrontRightLegAngle": "-5.8",\n' +
        '        "lowerBackLeftLegAngle": "-30",\n' +
        '        "lowerBackRightLegAngle": "43.9",\n' +
        '        "pawFrontLeftLegAngle": "136.3",\n' +
        '        "pawFrontRightLegAngle": "0.3",\n' +
        '        "pawBackLeftLegAngle": "24.9",\n' +
        '        "pawBackRightLegAngle": "64.9"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "8",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "23.8",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "70.3",\n' +
        '        "upperFrontRightLegAngle": "113.8",\n' +
        '        "upperBackLeftLegAngle": "105.1",\n' +
        '        "upperBackRightLegAngle": "73.8",\n' +
        '        "lowerFrontLeftLegAngle": "8.1",\n' +
        '        "lowerFrontRightLegAngle": "-9.4",\n' +
        '        "lowerBackLeftLegAngle": "-12.7",\n' +
        '        "lowerBackRightLegAngle": "-29.8",\n' +
        '        "pawFrontLeftLegAngle": "22.2",\n' +
        '        "pawFrontRightLegAngle": "0.1",\n' +
        '        "pawBackLeftLegAngle": "6.6",\n' +
        '        "pawBackRightLegAngle": "90.5"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "10",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "35.7",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "114.5",\n' +
        '        "upperFrontRightLegAngle": "64.3",\n' +
        '        "upperBackLeftLegAngle": "120",\n' +
        '        "upperBackRightLegAngle": "85.4",\n' +
        '        "lowerFrontLeftLegAngle": "-30.6",\n' +
        '        "lowerFrontRightLegAngle": "-60",\n' +
        '        "lowerBackLeftLegAngle": "-6.6",\n' +
        '        "lowerBackRightLegAngle": "-30",\n' +
        '        "pawFrontLeftLegAngle": "17.9",\n' +
        '        "pawFrontRightLegAngle": "180",\n' +
        '        "pawBackLeftLegAngle": "-8.1",\n' +
        '        "pawBackRightLegAngle": "41.3"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "12",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "-30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "120",\n' +
        '        "upperFrontRightLegAngle": "60",\n' +
        '        "upperBackLeftLegAngle": "120",\n' +
        '        "upperBackRightLegAngle": "97.2",\n' +
        '        "lowerFrontLeftLegAngle": "9",\n' +
        '        "lowerFrontRightLegAngle": "-32.2",\n' +
        '        "lowerBackLeftLegAngle": "43.2",\n' +
        '        "lowerBackRightLegAngle": "-13.6",\n' +
        '        "pawFrontLeftLegAngle": "-30",\n' +
        '        "pawFrontRightLegAngle": "130.9",\n' +
        '        "pawBackLeftLegAngle": "71",\n' +
        '        "pawBackRightLegAngle": "1.5"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "14",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "-9.7",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "108.1",\n' +
        '        "upperFrontRightLegAngle": "68.7",\n' +
        '        "upperBackLeftLegAngle": "78.7",\n' +
        '        "upperBackRightLegAngle": "112.2",\n' +
        '        "lowerFrontLeftLegAngle": "24.5",\n' +
        '        "lowerFrontRightLegAngle": "-22.4",\n' +
        '        "lowerBackLeftLegAngle": "-30",\n' +
        '        "lowerBackRightLegAngle": "-30",\n' +
        '        "pawFrontLeftLegAngle": "48.4",\n' +
        '        "pawFrontRightLegAngle": "67.9",\n' +
        '        "pawBackLeftLegAngle": "180",\n' +
        '        "pawBackRightLegAngle": "16.1"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "16",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "-9.8",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "-30",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "54.7",\n' +
        '        "upperFrontLeftLegAngle": "101.3",\n' +
        '        "upperFrontRightLegAngle": "72.6",\n' +
        '        "upperBackLeftLegAngle": "74",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-36.8",\n' +
        '        "lowerFrontRightLegAngle": "-20.9",\n' +
        '        "lowerBackLeftLegAngle": "-27.8",\n' +
        '        "lowerBackRightLegAngle": "-13.4",\n' +
        '        "pawFrontLeftLegAngle": "180",\n' +
        '        "pawFrontRightLegAngle": "67.9",\n' +
        '        "pawBackLeftLegAngle": "104.2",\n' +
        '        "pawBackRightLegAngle": "4.2"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "18",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "13.9",\n' +
        '        "upperFrontLeftLegAngle": "83",\n' +
        '        "upperFrontRightLegAngle": "101.1",\n' +
        '        "upperBackLeftLegAngle": "79.9",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-60",\n' +
        '        "lowerFrontRightLegAngle": "-20.9",\n' +
        '        "lowerBackLeftLegAngle": "-27.8",\n' +
        '        "lowerBackRightLegAngle": "8.8",\n' +
        '        "pawFrontLeftLegAngle": "180",\n' +
        '        "pawFrontRightLegAngle": "23",\n' +
        '        "pawBackLeftLegAngle": "57.2",\n' +
        '        "pawBackRightLegAngle": "-10.1"\n' +
        '    }, {\n' +
        '        "globalYaw": "0",\n' +
        '        "globalPitch": "0",\n' +
        '        "globalRoll": "90",\n' +
        '        "globalX": "0",\n' +
        '        "globalY": "0",\n' +
        '        "globalZ": "20",\n' +
        '        "headYaw": "0",\n' +
        '        "headPitch": "0",\n' +
        '        "headRoll": "-7.3",\n' +
        '        "tailStartYaw": "0",\n' +
        '        "tailStartPitch": "0",\n' +
        '        "tailStartRoll": "15",\n' +
        '        "tailMidYaw": "0",\n' +
        '        "tailMidPitch": "0",\n' +
        '        "tailMidRoll": "26.5",\n' +
        '        "tailEndYaw": "0",\n' +
        '        "tailEndPitch": "0",\n' +
        '        "tailEndRoll": "60",\n' +
        '        "upperFrontLeftLegAngle": "60",\n' +
        '        "upperFrontRightLegAngle": "120",\n' +
        '        "upperBackLeftLegAngle": "100.1",\n' +
        '        "upperBackRightLegAngle": "120",\n' +
        '        "lowerFrontLeftLegAngle": "-27.8",\n' +
        '        "lowerFrontRightLegAngle": "-5.8",\n' +
        '        "lowerBackLeftLegAngle": "-30",\n' +
        '        "lowerBackRightLegAngle": "43.9",\n' +
        '        "pawFrontLeftLegAngle": "136.3",\n' +
        '        "pawFrontRightLegAngle": "0.3",\n' +
        '        "pawBackLeftLegAngle": "24.9",\n' +
        '        "pawBackRightLegAngle": "64.9"\n' +
        '    }], "inBetweenFrameCount": [0, 30, 20, 30, 20, 20, 10, 20, 30, 20, 30, 20, 20, 10, 20, 30, 20, 30, 20, 20, 10]\n' +
        '}');
}

function loadRunCycle(){
    loadFromText('{"keyframes":[{"globalYaw":"0","globalPitch":"0","globalRoll":"82.3","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"12.5","tailStartYaw":"0","tailStartPitch":"30","tailStartRoll":"-23.2","tailMidYaw":"0","tailMidPitch":"-30","tailMidRoll":"15.4","tailEndYaw":"0","tailEndPitch":"30","tailEndRoll":"21.5","upperFrontLeftLegAngle":"120","upperFrontRightLegAngle":"116.2","upperBackLeftLegAngle":"60","upperBackRightLegAngle":"60.1","lowerFrontLeftLegAngle":"30","lowerFrontRightLegAngle":"30","lowerBackLeftLegAngle":"60","lowerBackRightLegAngle":"60","pawFrontLeftLegAngle":"121.1","pawFrontRightLegAngle":"120.5","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"-0.3","globalRoll":"81.3","globalX":"0","globalY":"0.5","globalZ":"0","headYaw":"-1.7","headPitch":"-1.6","headRoll":"9.4","tailStartYaw":"0","tailStartPitch":"30","tailStartRoll":"-8.5","tailMidYaw":"0","tailMidPitch":"-30","tailMidRoll":"-2.5","tailEndYaw":"0","tailEndPitch":"30","tailEndRoll":"21.5","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"120","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-30","lowerFrontRightLegAngle":"-19.2","lowerBackLeftLegAngle":"30","lowerBackRightLegAngle":"30","pawFrontLeftLegAngle":"180","pawFrontRightLegAngle":"88.4","pawBackLeftLegAngle":"88.6","pawBackRightLegAngle":"88.9"},{"globalYaw":"0","globalPitch":"-0.3","globalRoll":"100.4","globalX":"0","globalY":"0.2","globalZ":"0","headYaw":"-1.7","headPitch":"-1.6","headRoll":"-15","tailStartYaw":"0","tailStartPitch":"30","tailStartRoll":"4.5","tailMidYaw":"0","tailMidPitch":"-30","tailMidRoll":"-14.3","tailEndYaw":"0","tailEndPitch":"30","tailEndRoll":"-24.8","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"116","upperBackLeftLegAngle":"60","upperBackRightLegAngle":"89.5","lowerFrontLeftLegAngle":"-30","lowerFrontRightLegAngle":"-19.2","lowerBackLeftLegAngle":"60","lowerBackRightLegAngle":"60","pawFrontLeftLegAngle":"69.6","pawFrontRightLegAngle":"-12.7","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"}],"inBetweenFrameCount":[10,15,15]}');
}

function loadWalkCycle() {
    loadFromText('{"keyframes":[{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"23.8","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"0","tailEndPitch":"0","tailEndRoll":"54.7","upperFrontLeftLegAngle":"70.3","upperFrontRightLegAngle":"113.8","upperBackLeftLegAngle":"105.1","upperBackRightLegAngle":"73.8","lowerFrontLeftLegAngle":"8.1","lowerFrontRightLegAngle":"-9.4","lowerBackLeftLegAngle":"-12.7","lowerBackRightLegAngle":"-29.8","pawFrontLeftLegAngle":"22.2","pawFrontRightLegAngle":"0.1","pawBackLeftLegAngle":"6.6","pawBackRightLegAngle":"90.5"},{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"35.7","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"30","tailEndPitch":"0","tailEndRoll":"54.7","upperFrontLeftLegAngle":"114.5","upperFrontRightLegAngle":"64.3","upperBackLeftLegAngle":"120","upperBackRightLegAngle":"85.4","lowerFrontLeftLegAngle":"-30.6","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"-6.6","lowerBackRightLegAngle":"-30","pawFrontLeftLegAngle":"17.9","pawFrontRightLegAngle":"180","pawBackLeftLegAngle":"-8.1","pawBackRightLegAngle":"41.3"},{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"15","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"-30","tailEndPitch":"0","tailEndRoll":"54.7","upperFrontLeftLegAngle":"120","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"120","upperBackRightLegAngle":"97.2","lowerFrontLeftLegAngle":"9","lowerFrontRightLegAngle":"-32.2","lowerBackLeftLegAngle":"43.2","lowerBackRightLegAngle":"-13.6","pawFrontLeftLegAngle":"-30","pawFrontRightLegAngle":"130.9","pawBackLeftLegAngle":"71","pawBackRightLegAngle":"1.5"},{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"-9.7","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"30","tailEndPitch":"0","tailEndRoll":"54.7","upperFrontLeftLegAngle":"108.1","upperFrontRightLegAngle":"68.7","upperBackLeftLegAngle":"78.7","upperBackRightLegAngle":"112.2","lowerFrontLeftLegAngle":"24.5","lowerFrontRightLegAngle":"-22.4","lowerBackLeftLegAngle":"-30","lowerBackRightLegAngle":"-30","pawFrontLeftLegAngle":"48.4","pawFrontRightLegAngle":"67.9","pawBackLeftLegAngle":"180","pawBackRightLegAngle":"16.1"},{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"-9.8","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"-30","tailEndPitch":"0","tailEndRoll":"54.7","upperFrontLeftLegAngle":"101.3","upperFrontRightLegAngle":"72.6","upperBackLeftLegAngle":"74","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-36.8","lowerFrontRightLegAngle":"-20.9","lowerBackLeftLegAngle":"-27.8","lowerBackRightLegAngle":"-13.4","pawFrontLeftLegAngle":"180","pawFrontRightLegAngle":"67.9","pawBackLeftLegAngle":"104.2","pawBackRightLegAngle":"4.2"},{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"15","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"0","tailEndPitch":"0","tailEndRoll":"13.9","upperFrontLeftLegAngle":"83","upperFrontRightLegAngle":"101.1","upperBackLeftLegAngle":"79.9","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-20.9","lowerBackLeftLegAngle":"-27.8","lowerBackRightLegAngle":"8.8","pawFrontLeftLegAngle":"180","pawFrontRightLegAngle":"23","pawBackLeftLegAngle":"57.2","pawBackRightLegAngle":"-10.1"},{"globalYaw":"0","globalPitch":"0","globalRoll":"90","globalX":"0","globalY":"0","globalZ":"0","headYaw":"0","headPitch":"0","headRoll":"-7.3","tailStartYaw":"0","tailStartPitch":"0","tailStartRoll":"15","tailMidYaw":"0","tailMidPitch":"0","tailMidRoll":"26.5","tailEndYaw":"0","tailEndPitch":"0","tailEndRoll":"60","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"120","upperBackLeftLegAngle":"100.1","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-27.8","lowerFrontRightLegAngle":"-5.8","lowerBackLeftLegAngle":"-30","lowerBackRightLegAngle":"43.9","pawFrontLeftLegAngle":"136.3","pawFrontRightLegAngle":"0.3","pawBackLeftLegAngle":"24.9","pawBackRightLegAngle":"64.9"}],"inBetweenFrameCount":[20,30,20,30,20,20,10]}');
}

function loadAttack() {
    loadFromText('{"keyframes":[{"globalYaw":"0","globalPitch":"0","globalRoll":"99.4","globalX":"0.4","globalY":"-0.5","globalZ":"-0.9","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"-30","tailStartPitch":"6.1","tailStartRoll":"54.9","tailMidYaw":"-9.3","tailMidPitch":"5.4","tailMidRoll":"27.9","tailEndYaw":"30","tailEndPitch":"19","tailEndRoll":"36.8","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"74.2","upperBackRightLegAngle":"74.1","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"30.7","lowerBackRightLegAngle":"29.3","pawFrontLeftLegAngle":"93.9","pawFrontRightLegAngle":"93","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"0","globalRoll":"99.4","globalX":"0.4","globalY":"-0.5","globalZ":"-0.9","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"30","tailStartPitch":"30","tailStartRoll":"31.5","tailMidYaw":"-30","tailMidPitch":"-30","tailMidRoll":"5.6","tailEndYaw":"-24.2","tailEndPitch":"-17.4","tailEndRoll":"56.3","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"74.2","upperBackRightLegAngle":"74.1","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"30.7","lowerBackRightLegAngle":"29.3","pawFrontLeftLegAngle":"88.6","pawFrontRightLegAngle":"88.6","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"0","globalRoll":"99.4","globalX":"0.4","globalY":"-0.5","globalZ":"-0.9","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"-30","tailStartPitch":"6.1","tailStartRoll":"54.9","tailMidYaw":"-9.3","tailMidPitch":"5.4","tailMidRoll":"27.9","tailEndYaw":"30","tailEndPitch":"19","tailEndRoll":"36.8","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"74.2","upperBackRightLegAngle":"74.1","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"30.7","lowerBackRightLegAngle":"29.3","pawFrontLeftLegAngle":"93.9","pawFrontRightLegAngle":"93","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"0","globalRoll":"99.4","globalX":"0.4","globalY":"-0.5","globalZ":"-0.9","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"30","tailStartPitch":"30","tailStartRoll":"31.5","tailMidYaw":"-30","tailMidPitch":"-30","tailMidRoll":"5.6","tailEndYaw":"-24.2","tailEndPitch":"-17.4","tailEndRoll":"56.3","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"74.2","upperBackRightLegAngle":"74.1","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"30.7","lowerBackRightLegAngle":"29.3","pawFrontLeftLegAngle":"88.6","pawFrontRightLegAngle":"88.6","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"0","globalRoll":"99.4","globalX":"0.4","globalY":"-0.5","globalZ":"-0.9","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"-30","tailStartPitch":"6.1","tailStartRoll":"54.9","tailMidYaw":"-9.3","tailMidPitch":"5.4","tailMidRoll":"27.9","tailEndYaw":"30","tailEndPitch":"19","tailEndRoll":"36.8","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"74.2","upperBackRightLegAngle":"74.1","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"30.7","lowerBackRightLegAngle":"29.3","pawFrontLeftLegAngle":"93.9","pawFrontRightLegAngle":"93","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"0","globalPitch":"0","globalRoll":"99.4","globalX":"0.4","globalY":"-0.5","globalZ":"-0.9","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"30","tailStartPitch":"30","tailStartRoll":"31.5","tailMidYaw":"-30","tailMidPitch":"-30","tailMidRoll":"5.6","tailEndYaw":"-24.2","tailEndPitch":"-17.4","tailEndRoll":"56.3","upperFrontLeftLegAngle":"60","upperFrontRightLegAngle":"60","upperBackLeftLegAngle":"74.2","upperBackRightLegAngle":"74.1","lowerFrontLeftLegAngle":"-60","lowerFrontRightLegAngle":"-60","lowerBackLeftLegAngle":"30.7","lowerBackRightLegAngle":"29.3","pawFrontLeftLegAngle":"88.6","pawFrontRightLegAngle":"88.6","pawBackLeftLegAngle":"-30","pawBackRightLegAngle":"-30"},{"globalYaw":"5.7","globalPitch":"13.3","globalRoll":"77.8","globalX":"-0.3","globalY":"2","globalZ":"4.2","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"8.6","tailStartPitch":"-10.8","tailStartRoll":"-21.1","tailMidYaw":"-4.6","tailMidPitch":"-30","tailMidRoll":"-32.3","tailEndYaw":"3.7","tailEndPitch":"12.3","tailEndRoll":"11.1","upperFrontLeftLegAngle":"30","upperFrontRightLegAngle":"30","upperBackLeftLegAngle":"120","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-36.3","lowerFrontRightLegAngle":"-36.9","lowerBackLeftLegAngle":"65.1","lowerBackRightLegAngle":"66.5","pawFrontLeftLegAngle":"113.7","pawFrontRightLegAngle":"111.5","pawBackLeftLegAngle":"98.7","pawBackRightLegAngle":"98.6"},{"globalYaw":"-0.6","globalPitch":"-0.9","globalRoll":"107.4","globalX":"-0.3","globalY":"0.4","globalZ":"10.6","headYaw":"0.8","headPitch":"0.2","headRoll":"-15","tailStartYaw":"-3.1","tailStartPitch":"-10.8","tailStartRoll":"14.6","tailMidYaw":"8.5","tailMidPitch":"2.4","tailMidRoll":"8.6","tailEndYaw":"0.9","tailEndPitch":"-21.4","tailEndRoll":"11.1","upperFrontLeftLegAngle":"82.9","upperFrontRightLegAngle":"48.1","upperBackLeftLegAngle":"92.6","upperBackRightLegAngle":"120","lowerFrontLeftLegAngle":"-50.2","lowerFrontRightLegAngle":"-50.3","lowerBackLeftLegAngle":"90","lowerBackRightLegAngle":"51.8","pawFrontLeftLegAngle":"57.7","pawFrontRightLegAngle":"117.6","pawBackLeftLegAngle":"51.2","pawBackRightLegAngle":"17.8"}],"inBetweenFrameCount":[0,50,50,50,50,50,10,5]}');
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