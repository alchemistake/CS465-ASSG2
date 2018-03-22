var animator = document.getElementById("animator");

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
    } else if (kfs[0].parentNode.lastChild.disabled) {
        kfs[0].parentNode.lastChild.disabled = false;
    }
}

addKeyFrame();