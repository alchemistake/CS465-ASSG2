// Handles for the editor
const animator = document.getElementById("animator");
let editorKeyframe = 0;

// Add keyframes adds a keyframe that is same as currently selected one
function addKeyFrame() {
    // If animation is playing stop it
    if (playing)
        playing = false;
    // Number of frames between keyframes
    const nof = document.createElement("div");
    nof.className = "noOfFrames";
    nof.innerHTML = '<input style="width:40px" size="3" value="10" type="number">';
    animator.appendChild(nof);
    // Keyframe button
    const kf = document.createElement("div");
    kf.className = "keyframe";
    kf.innerHTML = '<button onclick="activateKeyframe(this)" class="loadKeyframe">KF</button><br><button onclick="deleteKeyframe(this)" class="deleteKeyframe">Delete</button>';
    animator.appendChild(kf);
    // Add keyframe to the animation.js handle
    keyframes.push({});
    // Update the active keyframe
    activateKeyframe(keyframes.length - 1);
    redoKeyframes();
}

// Delete keyframe for unwanted keyframes, takes a button element
function deleteKeyframe(keyframe) {
    // Index of keyframe
    const index = parseInt(keyframe.parentElement.firstElementChild.getAttribute("data-index"));
    // Corresponding in between frame count textbox
    const noOfFrames = document.getElementsByClassName("noOfFrames");
    // Remove them
    animator.removeChild(keyframe.parentElement);
    animator.removeChild(noOfFrames[index]);
    keyframes.splice(index, 1);
    redoKeyframes();

    // Activate editorKeyFrame if it is set 0 by other functions
    if (0 === editorKeyframe)
        activateKeyframe(editorKeyframe, true);
}

// Rearranges the keyframe and in between frame count textboxes
function redoKeyframes() {
    const kfs = document.getElementsByClassName("loadKeyframe");
    // Renumbering
    for (let i = 0; i < kfs.length; i++) {
        kfs[i].innerText = "KF " + (i + 1);
        kfs[i].setAttribute("data-index", i.toString());
    }
    // Active editor frame logic
    // if (kfs.length === 1) {
    //     // kfs[0].parentNode.lastChild.disabled = true;
    // } else { // noinspection Annotator
    //     if (kfs[0].parentNode.lastChild.disabled) {
    //         kfs[0].parentNode.lastChild.disabled = false;
    //     }
    // }

    updateInBetweenFrameCount();
}

// Filters editor variables by name
function filterVariables() {
    const box = document.getElementById("filter");
    const value = box.value;
    box.value = "";
    const variables = document.getElementsByClassName("variable");
    // Linear search
    for (let i = 0; i < variables.length; i++) {
        variables[i].hidden = variables[i].innerText.toLowerCase().indexOf(value.toLowerCase()) < 0;
    }

    return false;
}

// Creates editor sliders from the constraints in cat.js
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

//Used for updating editor screen when user decides to change keyframes that (s)he is editing
//Reads to current keyframe from animate.js
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

//Used for updating editor screen when user decides to change keyframes that (s)he is editing
//Writes current keyframe to animate.js
function saveVariablesToKeyframes(index) {
    const sliders = document.getElementsByClassName("slider");
    for (let i = 0; i < sliders.length; i++) {
        keyframes[index][sliders[i].name] = sliders[i].value;
    }
}

// When slider is moving the value has to update indicator, and canvas
function updateSliderIndicator(slider, span) {
    return function () {
        if (playing)
            playing = false;
        span.innerText = slider.value;
        jointVariables[slider.name] = slider.value;
        requestAnimationFrame(render);
    }
}

// Updates the view of editor and reads&writes to animate.js
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
    // keyframeButtons[index].disabled = true;
    editorKeyframe = index;
}

// frame count counterpart of redoKeyframes function
function updateInBetweenFrameCount() {
    const nof = document.getElementsByClassName("noOfFrames");

    inBetweenFrameCount = [];
    for (let i = 0; i < nof.length; i++) {
        inBetweenFrameCount.push(parseInt(nof[i].firstChild.value));
    }
}

// Start or stop the animation
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

// Creates a download containing the animation
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

// Creates a download containing the current keyframe
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

// Load a animation from user's file
function loadAnimation(evt) {
    const file = evt.target.files[0];
    const fr = new FileReader();

    fr.onload = function (e) {
        loadFromText(e.target.result);
    };

    fr.readAsText(file);
}

// Load a animation from text
// Used for loading files and hard coded animations
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

// Load a keyframe from user's file
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

// Initialize the editor
addKeyFrame();
generateVariables();
const c = document.getElementById("gl-canvas");
c.width = c.parentElement.clientWidth;
c.height = c.parentElement.clientHeight;

document.getElementById('fileAnimation').addEventListener('change', loadAnimation, false);
document.getElementById('fileKeyframe').addEventListener('change', loadKeyframe, false);

// Camera logic
let prevX, prevY, lastUpdate = 0;

// Tracks how much mouse has been moved since last update
function camera(event) {
    if (Date.now() - lastUpdate > mspf) {
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

// Adds camera movement listeners when mouse is down
c.addEventListener("mousedown", function (event) {
    prevX = event.clientX;
    prevY = event.clientY;

    c.addEventListener("mousemove", camera)
});

// Removes camera movement listeners when mouse is up
function finish() {
    c.removeEventListener("mousemove", camera);
    if (!playing)
        requestAnimFrame(render);
}

c.addEventListener("mouseup", finish);
c.addEventListener("mouseleave", finish);