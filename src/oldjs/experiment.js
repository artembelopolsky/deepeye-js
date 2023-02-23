
let img; // Declare variable 'img'.
let ready = false;
let prevTime;
let imgVisible = false;
let image_shown_once = false;


let FrameDataLog = {
    frameBase64String: -1,
    fName: 'SUBJ_NR',
    timestamp: -1,
    x: -1,
    y: -1,
    dotNr: -1,
    dotColor: -1,
    condition: -1,
    sampTime: -1,
    corrResp: -1,
    showArrow: -1,
    trialNr: -1,
    respKey: -1,
    target_type: -1,
    fullscreen_on: -1
}

let frameNr= -1; // count frames throughout the session
//const session_timestamp = new Date().toISOString().replace(/[T:-]/g, '_').replace(/\..+/, ''); //format timestamp, use as participant_id
let session_timestamp = localStorage.getItem('session_timestamp'); // this participant-id is set in head_position.js
//const session_timestamp = '2022_08_29_20_19_19';
let activeHTTPRequestCounter = 0;
let successfulHTTPRequestCounter = 0;
let isExperimentOver = false;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Webcam related
let base64data = [];
let video;
let stream;
let videoSettings;

const BASE_URL = "http://127.0.0.1:5000"; // local server
// const BASE_URL = "https://deepeye.labs.vu.nl/firebase";


function start_webcam() {
    // webcam device, use the id for integrated webcam, if set in head_position.js
    navigator.mediaDevices.getUserMedia({ video: { deviceId: localStorage.getItem("id_webcam") } })
    .then(function (mediaStream) {
        stream = mediaStream;
        video = document.getElementById("video");
        video.srcObject = mediaStream;
        videoSettings = mediaStream.getVideoTracks()[0].getSettings();

    });
}

function captureFrames(metaData) {
    return new Promise(function (resolve, reject) {
  
            const canvas = document.createElement('canvas');
  
            canvas.width = videoSettings.width;
            canvas.height = videoSettings.height;
  
            ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
  
            // count the frames throughout the session
            if (base64data.length != frameNr) {
              frameNr += 1;
            }
            const imageInstance = {
                frameBase64String: imageBase64,
                frameNr: frameNr+1,
                fName: session_timestamp + '_' + String(frameNr+1).padStart(5, '0') + '.jpg', //pad frameNr with leading zeros
                sampTime: metaData.timestamp,
                x: metaData.x,
                y: metaData.y,
                dotNr: metaData.dotNr,
                dotColor: metaData.dotColor,
                condition: metaData.condition,
                trialNr: metaData.trialNr,
                showArrow: metaData.showArrow,
                target_type: metaData.target_type,
                respKey: metaData.respKey,
                corrResp: metaData.corrResp,
                fullscreen_on: metaData.fullscreen_on,
                webcam_label: localStorage.getItem("label_webcam"),
                final_batch: metaData.final_batch // log the last batch of calibration
           }
  
            base64data.push(imageInstance);
  
            print(`Time Stamp frame: ${imageInstance.sampTime}`);
            print(`dotX: ${imageInstance.x}`);
            print(`dotY: ${imageInstance.y}`);
            print(`dotColor: ${imageInstance.dotColor}`);
            print(`condition: ${imageInstance.condition}`);
  
    });
  }
  
  function uploadData(frame_data, final_batch=false) {
  
    requestData = {
        'frame_data': frame_data,
        'system_info': system_info //(screen size, width, etc.)
    }
  
    activeHTTPRequestCounter += 1;

    fetch(BASE_URL + "/predict_user", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'experiment-id' : '../../../data/CalibrationGameJSDataset', // name of data folder on the server (connected to my SciStor)
            'participant-id' : session_timestamp, // participant's session timestamp id, globbally defined in parameters.js
            'type-dataset' : 'test', // training or testing calibration dataset
            'final-batch' : final_batch
        },
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

                
                welcomeButton.html('Done');                

                if(json.includes("data:image/jpg;base64,") ) {
                    done_validation = true;
                    background(255); // set to white
                    endExperimentButton.hide();
                    fullscreen(false);
                    updateResult(json); // update the validation result image placeholder
                    toggleElement("result-ready-div"); // turn on the updated image
                    stopBothVideoAndAudio(stream); // stop the webcam     
                }
            }
  
        })
        .catch(function (error) {
            activeHTTPRequestCounter -= 1;
              
        });
  }
  
  // stop both mic and camera
  function stopBothVideoAndAudio(stream) {
    stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live') {
            track.stop();
        }
    });
  }
/////////////////////////////////////////////////////////////////////

function welcome_fn() {
    fullscreen(true);
    welcomeButton.hide();
    // noCursor();
    ready = true;
    prevTime = millis();
}

function next_fn() {
    if (activeHTTPRequestCounter == 0) {
        jatos.startNextComponent();
    }

}


function setup() {
  
  
  pixelDensity(1);
  createCanvas(window.screen.width, window.screen.height);
  background(0);
  frameRate(60);
  
  img = loadImage("img/validationScreen9_black.jpg"); // Load the image

  welcomeButton = createButton('START EXPERIMENT');
  welcomeButton.style('color', color(25, 23, 200));
  welcomeButton.size(window.screen.width/4, window.screen.width/5/3);
  welcomeButton.style("font-family", "Comic Sans MS");
  welcomeButton.style("font-size", "25px");
  welcomeButton.position(window.screen.width/2, window.screen.height-window.screen.height/3);
  welcomeButton.center('horizontal');

  welcomeButton.mousePressed(welcome_fn);
  createCanvas(window.screen.width, window.screen.height);
  background(0);

  start_webcam();

  
}

function draw() {

    // console.log(`windowWidth = ${window.screen.width}, windowHeight = ${window.screen.height}`);
    
    
    if (ready == true) {
        timestamp = millis();

        
        FrameDataLog.timestamp = timestamp;
                
        // send every 10 frames to GCP
        if (base64data.length % 10 == 0 && base64data.length > 0) {
            uploadData(base64data.splice(0, base64data.length));          
        }


    //    console.log(`prevTime: ${prevTime}`);
       
        
        if (millis() > prevTime + 2000){
            imgVisible = !imgVisible;
            FrameDataLog.condition = 'image_on';
            prevTime = millis();
        }

        if(imgVisible) {
            // Displays the image at its actual size at point (0,0)
            image(img, 0, 0);  
            console.log('image shown');  
            image_shown_once = true;  
        }
        if(imgVisible == false) {
            background(0);
            console.log('no image'); 
            if (image_shown_once) {
                ready = false;
                isExperimentOver = true;
                welcomeButton.html('Wait...');
                welcomeButton.show();
                welcomeButton.mousePressed(next_fn);
                
                
            }
            
        }
       
    
        // capture frames at half the display frame rate
        if(frameCount%2==0) {
            captureFrames(FrameDataLog);
        }


    }
    
    
}












