let keyframes = [];
let inBetweenFrameCount = [];
let currentKeyframe = 0;
let frameCount = 0;

function interpolate() {
    const endFrame = (currentKeyframe + 1) % keyframes.length;
    const start = keyframes[currentKeyframe], end = keyframes[endFrame];
    const percentage = frameCount / inBetweenFrameCount[endFrame];

    for (const key of start) {
        jointVariables[key] = percentage * start[key] + (1 - percentage) * end[key]
    }
}