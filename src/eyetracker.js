import {html} from './eyetrack_html.js';
import {html as facehtml} from './facerecognizerHTML.js';
import {ParamHandler} from './paramhandler.js';
import  * as p5setup from './p5setup.js';
import {draw} from './p5jsDraw.js';
import * as helpers from './calibrationHelpers.js';
import * as params from './calibrationParams.js';
import {Dot} from './dot.js'
import {html as validation_html} from './validation_html.js'
import {FaceDetection} from './facerecognizer.js';

// import "jspsych"
// import "@jspsych/plugin-call-function"
// import "@jspsych/plugin-fullscreen"
// import "@jspsych/plugin-html-keyboard-response"
// import "@jspsych/plugin-image-keyboard-response"
// import "./lib/face-api.js"
// import "./lib/p5.min_mod.js"
import css from "./styles/main.css";
import camera from "./img/camera.jpg"
import 'bootstrap/dist/css/bootstrap.min.css'
// import faceapi from "./lib/face-api.js"
import * as faceapi from './lib/face-api.js';
// import * as tf from '@tensorflow/tfjs';
// import 'p5';

// import * as models from "./models/*"

/*

## idear to get weights in model:
-bundle model as string
-in this page save model to browser local storage
-then load it again from model storage with tf.io.loadWeights(localstorage://somepath)

- update 14-09
- stupid face api doesn't seem to support loading from local storage. 

https://tensorflow.org/js/guide/save_load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
 */



// import tinyfaceFileString from "./models/tiny_face_detector_model-shard1.bin"
// import tinyfaceJson from "./models/tiny_face_detector_model-weights_manifest.json"
// import { FaceLandmark68Net } from './lib/face-api.js';
// import "bootstrap-icons"


{/* <link rel="preload" href="./js/lib/p5.min_mod.js" as="script"></link>
<script src="./js/p5setup.js" type="module"></script>
<script src="./js/p5jsDraw.js" type="module"></script> */}

// import "os"




class EyeTracker {
    /**
     * Class that implements all functionality of eyetracker : 
     *      - calibration
     *      - testing
     *      - recording
     * and saving parameters such as webcam position
     */
    constructor(paramhtml,facehtml,validation_html){
        this.paramHandler = new ParamHandler(this, paramhtml);        
        this.faceDetection = new FaceDetection(this, facehtml);
        this.validation_html = validation_html;
        this.base64data = [];
        this.reqeustcounter = 0;
        this.timestamp;
        this.prevTime;
        this.num_dots = 0;
        this.deductTime =0;
        this.trial=0;
        this.pauze=false;
        this.startStaticDot = false; // called "ready" in old script
        this.videoSettings;
        this.video;
        this.webcamFrameRate;       
        this.finalbatch = false;
        this.type_dataset = 'train';
        this.index_conditions=0;
        this.frameCount=0;
        this.api_url = "https://deepeye-swarm.psy.vu.nl/firebase"; //"https://deepeye.labs.vu.nl/firebase"; 
        this.api_token = ''; //shoud be set in experiment html file
        this.experiment_id = 'Default'; // Default name for experiment, name should be set in experiment script
        this.fullscreen = false;
        this.CALIBRATION_STEPS = ['train', 'test']; // calibrate, then validate    
        
        this.return_jsPsych = false; // stores the callback function to return to jsPsych

        this.activeHTTPRequestCounter = 0;
        this.successfulHTTPRequestCounter = 0;
        this.isExperimentOver = false;
        // this.error_calibration = false;
        this.done_model_training = false;
        this.done_validation = false;
        // this.error_validation = false;
        this.countErrRespCalibration = 0; // count how many batches returned an error during /calibration request
        this.countErrRespValidation = 0; // count how many batches returned an error during /test request
        this.countErrRespRecording = 0; // count how many batches returned an error during /record request

        this.detections;
        this.numCalibDots = 9;
        this.numCalibrationAttempts = 0;
        this.maxCalibrationAttempts = 3; 
        this.validationThreshold = 3.0; // threshold needed to accept validation result
        this.validationOnly = false;
        
        this.CALIBRATION_COLOR_SCHEME = {
            fill: 0,
            background: 255,
            textStrokeWeight: 3,
            textStrokeColor: [0, 0, 0],
            color_bulls_eye: 255
          }
        
        // default screen and webcam settings
        this.system_info = {
            'screen_resolution': [screen.width, screen.height],
            'top_left_tocam_cm' : [-parseFloat(30.0)/2, -(1.0)],
            'scrW_cm' : parseFloat(30.0),
            'dpi_x' :  96.0,
            'webcamLabel': -1,
            'webcamFrameRate': -1
            }
        
        // different settings depending on jatos or demo mode
        this.demoMode = false;        
        
        // -1 means 'not set'
        this.FrameDataLog = {
            frameBase64String: -1,
            fName: 'SUBJ_NR',
            timestamp: -1,
            x: -1,
            y: -1,
            dotNr: -1,
            dotColor: -1,
            userLogVariables: -1, // used to save experimental variables to eyetracker's data object
            sampTime: -1,
            corrResp: -1,
            showArrow: -1,
            trialNr: -1,
            respKey: -1,
            target_type: -1,
            fullscreen_on: -1,
            frameNr:-1,
            numCalibDots:-1,
            pp_id: -1, // participant id from external platform (e.g. sona)
            event: -1, // event stamp from experiment
            }        
    }

    calibrate(done, validationOnly=false, numCalibDots=13, dotDuration=2300, calibrationBackground=255){        
        
        this.countErrRespCalibration = 0; // reset counter of how many batches returned an error during /calibration request
        this.countErrRespValidation = 0; // reset counter of how many batches returned an error during /test request                
               
        // demoMode uses default values
        if(this.demoMode == false) {
            this.validationOnly = validationOnly;
            this.numCalibDots = numCalibDots;
            this.FrameDataLog.numCalibDots = this.numCalibDots;
            this.dotDuration = dotDuration;        
            this.CALIBRATION_COLOR_SCHEME.background = calibrationBackground;
        }            
        
        // initialize webcam and face detection (returns a promise),  
        this.init_webcam() 
            .then(()=> {
                console.log('Resolved'); // after face dections is done, load p5js and start calibration                
                
                // Load p5 js NOTE: preload() is renamed to preload1() in p5.min.js to avoid conflict with jsPsych

                const preloadedScript = document.createElement("script");
                preloadedScript.setAttribute('id', 'preloaded-p5js');               
                preloadedScript.src = "https://deepeye.labs.vu.nl/resources/dependencies/p5.min_mod.js";       
                document.body.appendChild(preloadedScript);
                
                //set p5js setup and draw functions to start calibration
                window.setup = this.p5setup.setup; // this creates defaultCanvas that is required for p5js
                window.draw = this.p5draw;
                // window.mousePressed = helpers.mousePressed;
                document.body.style.overflow = 'hidden';
                this.return_jsPsych = done; // hang this function under the window.eyetracker object, called in calibrationHelpers.js 
                
                // if only validation should be run (assuming the user model has been generated during the session)
                if(this.validationOnly==true) {
                    this.CALIBRATION_STEPS = ['test']; // calibrate, then validate
                }
                else {
                    this.CALIBRATION_STEPS = ['train', 'test']; // calibrate, then validate
                }
                
                })
            .catch((err) => {
                    console.error(err)
            });      

    }

    record(wait_time){

        this.countErrRespRecording = 0; // reset counter of how many batches returned an error during /record request
        // html video tag for captureFrames() :
        //document.body.insertAdjacentHTML('afterbegin','<video class="layer2" id="video" autoplay hidden="true"></video>');
        //this.faceDetection.startVideo();
        
        this.base64data = []; // remove the remaining logs that were not transfered
        var start_time = performance.now();
          
        var interval = setInterval(function(){

            eyetracker.FrameDataLog.timestamp = performance.now();
            var time_left = wait_time - (eyetracker.FrameDataLog.timestamp - start_time);          
            
            helpers.captureFrames(eyetracker.FrameDataLog,); 

            // upload the frames right away
            if (eyetracker.base64data.length % 10 == 0 && eyetracker.base64data.length > 0) {
                
                helpers.uploadData(eyetracker.base64data.splice(0, eyetracker.base64data.length), 'record');              
            }

            if(time_left <= 0){                       
                // document.getElementById('video').remove();
                      
                clearInterval(interval);
                
                
            }
        }, 33.33)
        
    }

    init_webcam(){        
        // show webcam feed with face recognition
        // document.getElementById("video").hidden = false;
        return this.faceDetection.start();
    }
    
    
    setup(done){

        this.paramHandler.setHTML(); 
        this.return_jsPsych = done; // hang this function under the window.eyetracker object, called in calibrationHelpers.js

    }
    
    stopBothVideoAndAudio(stream) {
        // stop both mic and camera

        stream.getTracks().forEach(function(track) {
            if (track.readyState == 'live') {
                track.stop();
            }
        });
    }
    
}

console.log('executing eyetracker.js');
var eyetracker = new EyeTracker(html,facehtml,validation_html);
window.eyetracker=eyetracker;
window.helpers = helpers;
window.params = params;
window.Dot = Dot

eyetracker.p5setup = p5setup;
eyetracker.p5draw = draw;
window.camerapositionpng = camera

window.faceapi = faceapi;



// New approach (thanks to chatgpt)
// Create Blob URL to use in load form URI function from 

// Create a Blob from the imported binary data
// const blob = new Blob([tinyface], { type: 'application/octet-stream' });
// const tinyfaceurl = URL.createObjectURL(blob);

// await window.faceapi.nets.tinyFaceDetector.loadFromUri('https://deepeye.labs.vu.nl/resources/'); // load model serially

// await window.faceapi.nets.faceLandmark68Net.loadFromUri(FaceLandmark68Net); // load model serially


// window.faceapi.nets.faceLandmark68Net = FaceLandmark68Net; // load model serially

// console.log(tinyfaceFileString)

// localStorage.setItem('tinyface_detector_model-shard1', tinyfaceFileString);
// localStorage.setItem('tinyface_detector_model-weights_manifest.json', JSON.stringify(tinyfaceJson));
// window.faceapi = faceapi;
// const model = await tf.loadLayersModel('localstorage://tinyface_detector_model');


// var tinyfaceBinary = atob(tinyfaceFileString);


// var uint8Array = new Uint8Array(tinyfaceBinary.length);
// for (var i = 0; i < tinyfaceBinary.length; i++) {
//     uint8Array[i] = tinyfaceBinary.charCodeAt(i);
// }

// const tinyfaceFromBinary = await tf.loadLayersModel(tf.io.browserFiles([{
//     name: 'model',
//     data: uint8Array.buffer
// }]));
// const model = await tf.loadLayersModel('localstorage://tinyface_detector_model-shard1');
// faceapi.nets.tinyFaceDetector = tinyfaceFromBinary
// window.tinyface = tinyface;
// window.tinyface_json = tinyfaceJson;
// window.faceapi = faceapi;
// window.tf = tf
// await faceapi.nets.tinyFaceDetector.loadFromDisk('localstorage://');//tinyface_detector_model-shard1
