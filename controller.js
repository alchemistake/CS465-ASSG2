var animator = document.getElementById("animator");
var currentKeyframe = -1;

function addKeyFrame() {
    var nof = document.createElement("div");
    nof.className = "noOfFrames";
    nof.innerHTML = '<input style="width: 40px" size="3" value="10" type="number">';
    animator.appendChild(nof);
    var kf = document.createElement("div");
    kf.className = "keyframe";
    kf.innerHTML = '<button class="loadKeyframe">KF</button><br><button onclick="deleteKeyframe(this)" class="deleteKeyframe">Delete</button>';
    animator.appendChild(kf);

    keyframes.push({});

    redoKeyframes();
}

function deleteKeyframe(keyframe) {
    var index = parseInt(keyframe.parentElement.firstElementChild.getAttribute("data-index"));
    var noOfFrames = document.getElementsByClassName("noOfFrames");
    animator.removeChild(keyframe.parentElement);
    animator.removeChild(noOfFrames[index]);
    redoKeyframes();
}

function redoKeyframes() {
    var kfs = document.getElementsByClassName("loadKeyframe");
    for (var i = 0; i < kfs.length; i++) {
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
}

function filterVariables() {
    var box = document.getElementById("filter");
    var value = box.value;
    box.value = "";
    var variables = document.getElementsByClassName("variable");
    for (var i = 0; i < variables.length; i++) {
        variables[i].hidden = variables[i].innerText.toLowerCase().indexOf(value.toLowerCase()) < 0;
    }

    return false;
}

function generateVariables() {
    var wrapper = document.getElementById("variables");
    for (var i = 0; i < variables.length; i++) {
        var obj = variables[i];

        var inject = document.createElement("li");
        inject.className = "variable";
        var slider = document.createElement("input");
        var span = document.createElement("span");

        slider.type = "range";
        slider.min = obj.min;
        slider.max = obj.max.toString();
        slider.value = obj.val.toString();
        slider.name = obj.name;
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

function loadVariablesFromKeyframes(index){
    for (const key of Object.keys(jointVariables)) {
        var slider = document.getElementsByName(key)[0];
        slider.parentElement.lastElementChild.innerHTML = keyframes[index][key];
        slider.value = keyframes[index][key];
        jointVariables[key] = keyframes[index][key];
    }
    requestAnimationFrame(render);
}

function saveVariablesToKeyframes(index){
    for (const key of Object.keys(jointVariables)) {
        keyframes[index][key] = jointVariables[key];
    }
}

function updateSliderIndicator(slider, span) {
    return function () {
        span.innerText = slider.value;
        jointVariables[slider.name] = slider.value;
        requestAnimationFrame(render);
    }
}

addKeyFrame();
generateVariables();
var c = document.getElementById("gl-canvas");
c.width = c.parentElement.clientWidth;
c.height = c.parentElement.clientHeight;