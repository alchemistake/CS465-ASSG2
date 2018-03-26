let keyframes = [];
let inBetweenFrameCount = [];
let currentKeyframe = 0;
let frameCount = 0;
let playing = false;
let animation = null;

const fps = 60;
const spf = 1000. / fps;

function interpolate() {
    const endFrame = (currentKeyframe + 1) % keyframes.length;
    const start = keyframes[currentKeyframe], end = keyframes[endFrame];
    const percentage = frameCount / inBetweenFrameCount[endFrame];
    const squaredPercentage = percentage * percentage;
    const lambda = squaredPercentage / (2.0 * (squaredPercentage - percentage) + 1.0);

    for (const key of Object.keys(start)) {
        jointVariables[key] = lambda * end[key] + (1 - lambda) * start[key]
    }
}

function animate() {
    interpolate();
    render();
    let nextKeyframe = (currentKeyframe + 1) % keyframes.length;

    if (playing) {
        frameCount++;
        if (frameCount > inBetweenFrameCount[nextKeyframe]) {
            frameCount = 0;
            do {
                currentKeyframe = nextKeyframe;
                nextKeyframe = (currentKeyframe + 1) % keyframes.length;
            }while (inBetweenFrameCount[nextKeyframe] === 0);
        }

        animation = setTimeout(animate, spf);
    }
}