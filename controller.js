var animator = document.getElementById("animator");
var variables = [
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
        "min": -50,
        "max": 10,
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
        "max": 15,
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
        "min": 60,
        "max": 120,
        "val": 90
    }, {
        "name": "upperFrontRightLegAngle",
        "min": 60,
        "max": 120,
        "val": 90
    }, {
        "name": "upperBackLeftLegAngle",
        "min": 60,
        "max": 120,
        "val": 90
    }, {
        "name": "upperBackRightLegAngle",
        "min": 60,
        "max": 120,
        "val": 90
    }, {
        "name": "lowerFrontLeftLegAngle",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "lowerFrontRightLegAngle",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "lowerBackLeftLegAngle",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "lowerBackRightLegAngle",
        "min": -30,
        "max": 30,
        "val": 0
    }, {
        "name": "pawFrontLeftLegAngle",
        "min": -60,
        "max": 60,
        "val": 0
    }, {
        "name": "pawFrontRightLegAngle",
        "min": -60,
        "max": 60,
        "val": 0
    }, {
        "name": "pawBackLeftLegAngle",
        "min": -60,
        "max": 60,
        "val": 0
    }, {
        "name": "pawBackRightLegAngle",
        "min": -60,
        "max": 60,
        "val": 0
    }
];

function addKeyFrame() {
    var nof = document.createElement("div");
    nof.className = "noOfFrames";
    nof.innerHTML = '<input style="width: 40px" size="3" value="10" type="number">';
    animator.appendChild(nof);
    var kf = document.createElement("div");
    kf.className = "keyframe";
    kf.innerHTML = '<button class="loadKeyframe">KF</button><br><button onclick="deleteKeyframe(this)" class="deleteKeyframe">Delete</button>';
    animator.appendChild(kf);
    fixKeyFrameNumbering();
}

function deleteKeyframe(keyframe) {
    var index = parseInt(keyframe.parentElement.firstElementChild.getAttribute("data-index"));
    var noOfFrames = document.getElementsByClassName("noOfFrames");
    animator.removeChild(keyframe.parentElement);
    animator.removeChild(noOfFrames[index]);
    fixKeyFrameNumbering();
}

function fixKeyFrameNumbering() {
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

function updateSliderIndicator(slider, span) {
    return function () {
        span.innerText = slider.value;
        jointVariables[slider.name] = slider.value;
        requestAnimationFrame(render);
    }
}


var c = document.getElementById("gl-canvas");
c.width = c.parentElement.clientWidth;
c.height = c.parentElement.clientHeight;
addKeyFrame();
generateVariables();