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

import "jspsych"
import "@jspsych/plugin-call-function"
import "@jspsych/plugin-fullscreen"
import "@jspsych/plugin-html-keyboard-response"
import "@jspsych/plugin-image-keyboard-response"
import "face-api.js"
import "os"
import "p5js"
import css from "./styles/main.css";



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
        this.api_url = "https://deepeye-swarm.psy.vu.nl/firebase"
        this.fullscreen = false;
        this.CALIBRATION_STEPS = ['train', 'test']; // calibrate, then validate    
        
        this.return_jsPsych = false; // stores the callback function to return to jsPsych

        this.activeHTTPRequestCounter = 0;
        this.successfulHTTPRequestCounter = 0;
        this.isExperimentOver = false;
        this.error_calibration = false;
        this.done_model_training = false;
        this.done_validation = false;
        this.error_validation = false;

        this.detections;
        this.numCalibDots = 13;
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
            'screen_resolution': [screen.width, screen.width],
            'top_left_tocam_cm' : [-parseFloat(30.0)/2, -(1.0)],
            'scrW_cm' : parseFloat(30.0),
            'dpi_x' :  96.0,
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
            condition: -1,
            sampTime: -1,
            corrResp: -1,
            showArrow: -1,
            trialNr: -1,
            respKey: -1,
            target_type: -1,
            fullscreen_on: -1,
            frameNr:-1
            }
    }

    calibrate(done, validationOnly=false, numCalibDots=13, dotDuration=2300, calibrationBackground=255){        
        
        // demoMode uses default values
        if(this.demoMode == false) {
            this.validationOnly = validationOnly;
            this.numCalibDots = numCalibDots;
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
                preloadedScript.src = "./js/lib/p5.min_mod.js";       
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

    record(wait_time, condition){

        // html video tag for captureFrames() :
        //document.body.insertAdjacentHTML('afterbegin','<video class="layer2" id="video" autoplay hidden="true"></video>');
        //this.faceDetection.startVideo();
        
        this.base64data = []; // remove the remaining logs that were not transfered
        var start_time = performance.now();
          
        var interval = setInterval(function(){

            eyetracker.FrameDataLog.timestamp = performance.now();
            var time_left = wait_time - (eyetracker.FrameDataLog.timestamp - start_time);
            
            eyetracker.FrameDataLog.condition = condition;
            helpers.captureFrames(eyetracker.FrameDataLog); 

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
