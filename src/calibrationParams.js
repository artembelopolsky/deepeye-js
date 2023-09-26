

export const BLACK_ON_GREY = {
    fill: 0,
    background: 160,
    textStrokeWeight: 3,
    textStrokeColor: [0, 0, 0],
    color_bulls_eye: 255
}

export const GREY_ON_BLACK = {
    fill: 200,
    background: 0,
    textStrokeWeight: 3,
    textStrokeColor: [255, 255, 255],
    color_bulls_eye: 0
}

export const INSTRUCTIONS = {
    'static_dot' : 'During this trial, dots will appear one by one on your screen.\n \
     Focus your eyes at the center of each dot until it dissappears.',
    'moving_dot' : 'During this trial, you will see a moving dot on your screen.\n \
     Follow the dot with your eyes. When a ← or → appears on the dot,\n press the button with the same arrow on your keyboard\n as fast and as accurate as possible.\n'
}

//default experiment configs
export var staticDotConfig = {
    total_trials: 1,
    dotDuration: 2300, // time dot is present
    dotAbsenceDuration: 0, // time dot is absent
    total_dots: 9,
    dot_diam_max: 50,
    dot_diam_min: 18,
    style: GREY_ON_BLACK,
    delayWebcamCapture: 800 // time between dot presentation and start of frame capture
}

export var movingDotConfig = {
    total_trials: 1,
    segmentDuration: 4000, // dot without an arrow
    arrowDuration: 2500,  // arrow presentation duration
    num_bounces_per_side: 3,
    step_size_x: 7,
    dot_diam_max: 50,
    dot_diam_min: 18,
    style: GREY_ON_BLACK
}


// export let FrameDataLog = {
//     frameBase64String: -1,
//     fName: 'SUBJ_NR',
//     timestamp: -1,
//     x: -1,
//     y: -1,
//     dotNr: -1,
//     dotColor: -1,
//     condition: -1,
//     sampTime: -1,
//     corrResp: -1,
//     showArrow: -1,
//     trialNr: -1,
//     respKey: -1,
//     target_type: -1,
//     fullscreen_on: -1
// }
