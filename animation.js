var keyframes = [];
var inBetweenFrameCount = [];
var startOfKeyframes = [];
var frameCount = 0;

function interpolate(startFrame) {
    var endFrame = (startFrame + 1) % keyframes.length;
    var start = keyframes[startFrame], end = keyframes[endFrame];
    var relativeFrameCount = frameCount - startOfKeyframes; // TODO fix here
    var total = 1. * inBetweenFrameCount[startFrame];
    var percentage = relativeFrameCount / total;

    for (var key in start) {
        if (start.hasOwnProperty(key)) {
            jointVariables[key] = percentage * start[key] + (1 - percentage) * end[key]
        }
    }
}