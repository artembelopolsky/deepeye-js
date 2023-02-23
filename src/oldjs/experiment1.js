// const authInstance = new GoogleAuthentication();
// const app = authInstance.getFirebaseInstance();

// app.auth().onAuthStateChanged(function (user) {
//     if (user) {

//     } else {
//         window.location.href = '../index.html';
//     }
// });

var activeHTTPRequestCounter = 0;
var successfulHTTPRequestCounter = 0;
var isExperimentOver = false;
var base64Img;
//var experiment_id = uuidv4();
var experiment_id = Date.now();

const timer = new Timer();
var selectedImage = 'img/validationScreen9_black.jpg';
var experimentResult;
var timeoutId;
var captureFrameDuration;
var base64data = [];
var video;
var stream;
var videoSettings;
var frameCounts = 0;

const BASE_URL = "https://deepeye.labs.vu.nl/firebase";
var FRAME_CAPTURE_PARAM = { duration : 2, mode : 'EXPERIMENT'}
var EXPERIMENT_DURATION = 6;
var FACEDETECTION_DURATION = 1;
let api_creds = 'oDX2s7hyFHjROJKnov8lhkexW0vPB6SBMxsOaUg4ZFzgw9D0J7yNKSVfrXNX' // user token

navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (mediaStream) {
        stream = mediaStream;
        video = document.getElementById("video");
        video.srcObject = mediaStream;
        videoSettings = mediaStream.getVideoTracks()[0].getSettings();
        document.getElementById('capture').disabled = false;
        video.style.transform = "scale(-1,1)"; // flips the video horizontally (mirrors)
    });

function captureFrames() {

    return new Promise(function (resolve, reject) {
        const timeInSeconds = Math.round(timer.getTime() / 1000);
        if (timeInSeconds <= FRAME_CAPTURE_PARAM.duration) {

            const canvas = document.createElement('canvas');
            canvas.width = videoSettings.width;
            canvas.height = videoSettings.height;

            ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            const imageInstance = {
                frameBase64String: imageBase64,
                fileName: frameCounts++,
                timestamp: new Date(),
                sampTime: timer.getTime() 
            }
            // console.log('Date Time ', Date.now());
            base64data.push(imageInstance);

            if (base64data.length % 10 == 0) { dataReceiver(base64data.splice(0, 10)); }

            timeoutId = setTimeout(function () { captureFrames().then(resolve); }, 1000 / 30);

        } else {

            clearTimeout(timeoutId);
            resolve();
        }
    });
}

function runFaceDetection() {

    FRAME_CAPTURE_PARAM.duration = FACEDETECTION_DURATION;
    FRAME_CAPTURE_PARAM.mode = "FACE_DETECTION";

    // toggleElement("faceDetectBtn"); 
    // toggleElement("faceDetectText");

    timer.start();
    captureFrames().then(function () { timer.stop(); base64data = []; });
}

function runExperiment() {

    FRAME_CAPTURE_PARAM.duration = EXPERIMENT_DURATION;
    FRAME_CAPTURE_PARAM.mode = "EXPERIMENT";

    getImageBase64();

    toggleElement("experiment-img");
    var elem = document.getElementById("image");
    elem.src = selectedImage;

    toggleFullScreen(elem).then(function (isFullScreen) {
        if (isFullScreen) {
            timer.start();
            captureFrames().then(function () {
                timer.stop();
                toggleFullScreen(elem).then(function (isFullScreen) {
                    if (!isFullScreen) {
                        toggleElement("experiment-img");
                        toggleElement("experiment-div");
                        toggleElement("result-processing-div");
                        stream.getTracks().forEach(track => {
                            track.stop();
                        });
                        updateProgressBar(); //starts progress bar animation
                    }
                    isExperimentOver = true;
                });
            });
        }
    });
}

function dataReceiver(data) {
    //receives frame data and call the API based on mode
    if (FRAME_CAPTURE_PARAM.mode == "FACE_DETECTION") {
        getFaceDetectionResult(data);
    } else if (FRAME_CAPTURE_PARAM.mode = "EXPERIMENT") {
        uploadData(data);
    }
}

function toggleElement(elementId) {
    var x = document.getElementById(elementId);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function updateResult(response) {
    const image = document.getElementById("result-image");
    image.src = response;
    experimentResult = response;
    //Once the result is disolayed to the user, wait for 3 seconds and ask for feedback
    setTimeout(function(){
        $('#feedback_modal').modal('show');
    },10000);
}

function showFeedbackForm(){
    $('#feedback_modal').modal('show');
}

function updateProgressBar(){
    $(function() {
        var current_progress = 0;
        var interval = setInterval(function() {
            current_progress += 3;
            $("#dynamic")
            .css("width", current_progress + "%")
            .attr("aria-valuenow", current_progress)
            .text("Processing");
            if (current_progress >= 100)
                clearInterval(interval);
        }, 1000);
      });
}

function getImageBase64() {

    var image = document.getElementById("image");
    image.crossOrigin = "Anonymous";
    image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        base64Img = canvas.toDataURL('image/jpeg').split(',')[1];
    }
}

function downloadResult() {
    var dlnk = document.getElementById('downloadLink');
    dlnk.download = experiment_id + ".jpg";
    dlnk.href = experimentResult;
    dlnk.click();
}

function uploadData(frame_data) {
    // var api_creds = document.cookie.split('; ')
    //     .find(row => row.startsWith('user_token='))
    //     .split('=')[1];
         

    requestData = {
        'frame_data': frame_data,
        'system_info': system_info
    }
    activeHTTPRequestCounter += 1;
    fetch(BASE_URL + "/uploadFrames", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'experiment-id': experiment_id,
             'user-token': api_creds,
        },
        // credentials: 'include',
        body: JSON.stringify(requestData),
    })
        .then(function (response) {
            if (response.ok) {
                return response;
            }
            throw Error(response.statusText);
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            activeHTTPRequestCounter -= 1;
            successfulHTTPRequestCounter += 1;
            if (isExperimentOver && activeHTTPRequestCounter == 0) {
                getPredictions();
            }
        })
        .catch(function (error) {

            activeHTTPRequestCounter -= 1;
            if (isExperimentOver && activeHTTPRequestCounter == 0) {
                if (successfulHTTPRequestCounter >= 1) {
                    getPredictions();
                } else {
                    toggleElement("result-processing-div");
                    toggleElement("result-error-div");
                }
            }
        });
}

function adaptUserCredit(mode = 'deduct'){
    var csrf_token = document.querySelectorAll('[name="_token"]')[0].value
    var querystring = '_method=PUT&_token='+csrf_token
    fetch(LRVL_URL + '/user-'+mode+'-credit',{
        method:'PUT',
        credentials:'include',
        // mode:'no-cors',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
        },
        body: querystring
    })
}

function getPredictions() {

    // var api_creds = document.cookie.split('; ')
    // .find(row => row.startsWith('user_token='))
    // .split('=')[1];
    activeHTTPRequestCounter += 1;

    requestData = {
        'display_image': base64Img,
        'system_info': system_info
    }
    fetch(BASE_URL + "/getPredictions", {
        method: 'POST',
        // credentials:'exclude',
        headers: {
            'Content-Type': 'application/json',
            'experiment-id': experiment_id,
            'user-token':api_creds,
        },
        //credentials:'include',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            // adaptUserCredit(mode='deduct');
            activeHTTPRequestCounter -= 1;
            toggleElement("result-processing-div");
            toggleElement("result-ready-div");
            updateResult(data);
        })
        .catch((error) => {
            console.error('Error:', error);
            activeHTTPRequestCounter -= 1;
            toggleElement("result-processing-div");
            toggleElement("result-error-div");
            // adaptUserCredit(mode='add')
        });
}

function getFaceDetectionResult(frame_data) {

    // var api_creds = document.cookie.split('; ')
    // .find(row => row.startsWith('user_token='))
    // .split('=')[1];

    requestData = {
        'frame_data': frame_data,
        'system_info': system_info
    }

    fetch(BASE_URL + "/faceDetection", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'experiment-id': experiment_id,
            'user-token':api_creds,

        },
        credentials:'include',
        body: JSON.stringify(requestData),
    })
        .then(function (response) {
            if (response.ok) {
                return response;
            }
            throw Error(response.statusText);
        })
        .then(function (response) {
            return response.json();
        })
        .then(data => {

            if (data == 'face_detected') {
                // toggleElement("faceDetectText");
                // toggleElement("capture");
                document.getElementById("video").style.border = "5px solid green";
            } else {
                document.getElementById("video").style.border = "5px solid red";
                toggleElement("faceDetectBtn");
                toggleElement("capture");
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function downloadCSV() {
    // var api_creds = document.cookie.split('; ')
    // .find(row => row.startsWith('user_token='))
    // .split('=')[1];

    fetch(BASE_URL + "/getCSV", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'experiment-id': experiment_id,
            'user-token':api_creds,
        },
        //credentials:'include'
    })
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .then(uril => {
        var link = document.createElement("a");
        link.href = uril;
        link.download = experiment_id + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}