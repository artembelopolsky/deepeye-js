import { resetSetup } from "./p5setup.js";

export const vars = {};


export function captureFrames(metaData) {
    return new Promise(function (resolve, reject) {
  
        const canvas = document.createElement('canvas');

        canvas.width = eyetracker.videoSettings.width;
        canvas.height = eyetracker.videoSettings.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(eyetracker.video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

        

        // run face detection    
        // console.log('Is this working?'); 
        // async()=> {       
        //     eyetracker.detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        // }
        // let d = eyetracker.detections;
        // console.log(`Detections: ${d}`);
       
        
        
            

        // count the frames throughout the session
        if (eyetracker.base64data.length != eyetracker.FrameDataLog.frameNr) {
            eyetracker.FrameDataLog.frameNr += 1;
        }
        const imageInstance = {
            frameBase64String: imageBase64,
            frameNr: metaData.frameNr+1,
            fName: eyetracker.paramHandler.session_timestamp + '_' + String(metaData.frameNr+1).padStart(5, '0') + '.jpg', //pad frameNr with leading zeros
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
        //console.log(imageInstance.frameBase64String);
        console.log(imageInstance.frameNr);
        eyetracker.base64data.push(imageInstance);

        // print(`Time Stamp frame: ${imageInstance.sampTime}`);
        // print(`dotX: ${imageInstance.x}`);
        // print(`dotY: ${imageInstance.y}`);
        // print(`dotColor: ${imageInstance.dotColor}`);
        // print(`condition: ${imageInstance.condition}`);
  
    });
}

export function uploadData(frame_data, type_dataset='train', final_batch=false) {

    let requestData = {
        'frame_data': frame_data,
        'system_info': eyetracker.system_info //(screen size, width, etc.)
    }   
  
    eyetracker.activeHTTPRequestCounter += 1;

    var headers = {
        'Content-Type': 'application/json',
        'experiment-id' : 'Test_CalibrationConfig_01', // name of data folder on the server
        'participant-id' : eyetracker.paramHandler.session_timestamp, // participant's session timestamp id, globbally defined in parameters.js
        'type-dataset' : type_dataset, // training or testing calibration dataset
        'final-batch' : eyetracker.final_batch,
        'user-token' : 'dHs1XlfeWlM38NCqQHpoaxVjqH3JNkYYwHqpA6FmAg20jy2ba3ZR10hVSeBl'
    }
    
    if(type_dataset == 'train') {
        fetch(eyetracker.api_url + "/calibrate", {
            method: 'POST',
            headers: headers,
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
                eyetracker.activeHTTPRequestCounter -= 1;
                // successfulHTTPRequestCounter += 1;
                console.log(eyetracker.isExperimentOver)
                console.log(eyetracker.activeHTTPRequestCounter == 0)
                if (eyetracker.isExperimentOver && eyetracker.activeHTTPRequestCounter == 0) {
                    console.log('trainUserModel should start')
                    helpers.trainUserModel(headers,requestData);
                }
    
            })
            .catch(function (error) {
                console.error(error);
                eyetracker.activeHTTPRequestCounter -= 1;
                if (eyetracker.isExperimentOver && eyetracker.activeHTTPRequestCounter == 0) {
                    error_calibration= true;
                    helpers.vars.endExperimentButton.html('Error processing frames.\n Click to restart');
                    
                    //restart calibration with the same parameters     
                    helpers.vars.endExperimentButton.mousePressed(()=> { remove(); // removes p5js library
                                                                        eyetracker.calibrate(eyetracker.return_jsPsych,
                                                                        eyetracker.validationOnly, eyetracker.numCalibDots,
                                                                        eyetracker.dotDuration, eyetracker.CALIBRATION_COLOR_SCHEME.background);
                                                                        }
                                                                    );
                }
            });
    }
    else if(type_dataset == 'test') {       

        fetch(eyetracker.api_url + "/predict_user", {
            method: 'POST',
            headers: headers,             
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
      
                eyetracker.activeHTTPRequestCounter -= 1;
                //successfulHTTPRequestCounter += 1;
                if (eyetracker.isExperimentOver && eyetracker.activeHTTPRequestCounter == 0) {
                    helpers.plotValidationResults(headers, requestData);
                }
      
            })
            .catch(function (error) {
                console.error(error);
                eyetracker.activeHTTPRequestCounter -= 1;
                if (eyetracker.isExperimentOver && eyetracker.activeHTTPRequestCounter == 0) {
                    error_validation = true;
                    helpers.vars.endExperimentButton.html('Error processing frames.\n Click to restart');

                    //restart calibration with the same parameters     
                    helpers.vars.endExperimentButton.mousePressed(()=> { remove(); // removes p5js library
                                                                        eyetracker.calibrate(eyetracker.return_jsPsych,
                                                                        eyetracker.validationOnly, eyetracker.numCalibDots,
                                                                        eyetracker.dotDuration, eyetracker.CALIBRATION_COLOR_SCHEME.background);
                                                                        }
                                                                );
                }
                  
            });
    }
    else if(type_dataset == 'record') {
        fetch(eyetracker.api_url + "/predict_user", {
            method: 'POST',
            headers: headers,             
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
      
                eyetracker.activeHTTPRequestCounter -= 1;
                
      
            })
            .catch(function (error) {
                console.error(error);
                eyetracker.activeHTTPRequestCounter -= 1;

                //restart calibration with the same parameters     
                helpers.vars.endExperimentButton.mousePressed(()=> {remove(); // removes p5js library
                                                                    eyetracker.calibrate(eyetracker.return_jsPsych,
                                                                    eyetracker.validationOnly, eyetracker.numCalibDots,
                                                                    eyetracker.dotDuration, eyetracker.CALIBRATION_COLOR_SCHEME.background);
                                                                    }
                                                                );

                // if (eyetracker.isExperimentOver && eyetracker.activeHTTPRequestCounter == 0) {
                //   error_validation = true;
                //   helpers.vars.endExperimentButton.html('Error processing frames.\n Click to restart');
                // }
                  
            });
    }
}


export function trainUserModel(headers,requestData){
  
    fetch(eyetracker.api_url + "/trainUserModel", {
      method: 'POST',
      headers: headers,
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
  
        if(json == 'Done model training') {
          eyetracker.done_model_training = true;
          helpers.vars.endExperimentButton.html('Calibration completed.\n Click to continue'); 
          helpers.vars.endExperimentButton.mousePressed(helpers.next_condition);         
        }
      })
      .catch(function (error) {
        console.error(error);
        eyetracker.error_calibration = true;
        helpers.vars.endExperimentButton.html('Calibration error.\n Click to restart');
        
        //restart calibration with the same parameters     
        helpers.vars.endExperimentButton.mousePressed(()=> { remove(); // removes p5js library
                                                            eyetracker.calibrate(eyetracker.return_jsPsych,
                                                            eyetracker.validationOnly, eyetracker.numCalibDots,
                                                            eyetracker.dotDuration, eyetracker.CALIBRATION_COLOR_SCHEME.background);
                                                            }
                                                        );
      });
  
  }

export function plotValidationResults(headers, requestData) {

    // if you want to record all attempted testdatasets in one file
    if(eyetracker.demoMode == false) {
        headers['final-batch'] = 'keep_testdataset';
    }

    fetch(eyetracker.api_url + "/plotValidationResults", {
      method: 'POST',
      headers: headers,       
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
        // json is an json dict with [b64 image, mean_err and std_err]
  
        if(json['b64image'].includes("data:image/jpg;base64,") ) {
            
            let meanError =  parseFloat(json['mean_err']);
            let stdError = parseFloat(json['std_err']);                   

            eyetracker.done_validation = true;
            background(255); // set to white
            helpers.vars.endExperimentButton.hide();            
            noLoop();
        
            document.body.style.overflow = "visible"; // turns the page scroller back on (turned off in html)
            document.getElementById('defaultCanvas0').style.display = 'none'
            document.getElementsByClassName("jspsych-content-wrapper")[0].style.display = "none";

            var div = document.createElement('validationResult');
            div.setAttribute('id', 'validation-result'); 
            document.body.appendChild(div);
            div.innerHTML = eyetracker.validation_html;          
                    
            const image = document.getElementById("result-image");
            image.src = json['b64image'];

          
          
          // enable accept button if calibration error is below validationThreshold
          // only in JATOS mode
            if(eyetracker.demoMode == false) {
                let textNode1, textNode2;
                if(document.getElementById("accept-button")) {            
                    if(meanError <= eyetracker.validationThreshold) {                   
                        document.getElementById("accept-button").disabled = false;
                        document.getElementById("recalibrate-button").disabled = true;
                    }
                    // add text informing about validationThreshold
                    else {
                        // when only validation, no need to redo it
                        if(eyetracker.validationOnly == false){
                            
                            document.getElementById("accept-button").disabled = true;

                            if(eyetracker.numCalibrationAttempts+1 == eyetracker.maxCalibrationAttempts) {
                                textNode1 = document.createTextNode('You could not be calibrated for this configuration, please continue');
                                document.getElementById("accept-button").disabled = false;
                                document.getElementById("recalibrate-button").disabled = true;
                            }
                            else { 
                                textNode1 = document.createTextNode(`Try again: The error needs to be below ${eyetracker.validationThreshold} cm. Check your lighting conditions.`);
                            }
                            
                            textNode2 = document.createTextNode(`Calibration attempt ${eyetracker.numCalibrationAttempts+1} out of ${eyetracker.maxCalibrationAttempts}`);
                            document.getElementById("text-message").style.fontSize = "20px";
                            document.getElementById("text-message").appendChild(textNode1);
                            document.getElementById("text-message").appendChild(document.createElement("br"));
                            document.getElementById("text-message").appendChild(textNode2);
                        }
                        else {
                            document.getElementById("accept-button").disabled = false;
                            document.getElementById("recalibrate-button").disabled = true;
                            textNode1 = document.createTextNode('Please continue');
                            document.getElementById("text-message").style.fontSize = "20px";
                            document.getElementById("text-message").appendChild(textNode1);
                        }
                    }
                }
            }
            else {document.getElementById("accept-button").disabled = false; }
          

            // reset log variables
            eyetracker.FrameDataLog.frameNr = -1;
            eyetracker.FrameDataLog.timestamp = -1;
            eyetracker.FrameDataLog.trialNr = -1;
            eyetracker.base64data = []; // remove the logs remaining from validation

            // pass the stored callback function to be able to return back to jsPsych
            document.getElementById("accept-button").addEventListener("click", ()=> {            
                document.getElementById('validation-result').remove();            
                document.getElementById('face-screen').style.display= 'none'; // hide face detection html to keep using video tag during recording
                
                remove(); // removes p5js library
                document.getElementById("preloaded-p5js").remove(); // remove html element
                document.getElementsByClassName("jspsych-content-wrapper")[0].style.display = "flex";
                eyetracker.numCalibrationAttempts = 0; // reset the number of calibration attempts
                eyetracker.return_jsPsych();
            }); 
           
        
            // Add restart calibration to 're-calibrate' button
            document.getElementById("recalibrate-button").addEventListener("click", ()=> {            
                document.getElementById('validation-result').remove();           
                // new way: show webcam feed during recalibration
                document.getElementById('face-screen').style.display= 'none'; // hide face detection html to keep using video tag during recording            
                remove(); // removes p5js library
                document.getElementById("preloaded-p5js").remove(); // remove html element 
                
                // track the number of calibration attempts
                eyetracker.numCalibrationAttempts += 1;
                console.log(`Calibration attempt #: ${eyetracker.numCalibrationAttempts+1}`);

                // for Jatos deployment, not for Demo
                // end study after max unsuccessful recalibration attempts
                // if(eyetracker.demoMode == false) {
                //     if(eyetracker.numCalibrationAttempts == eyetracker.maxCalibrationAttempts) {jatos.endStudy();}
                // }
                
                // recalibrate with the same parameters (e.g. number of calibration dots) as in the original call
                eyetracker.calibrate(eyetracker.return_jsPsych, eyetracker.validationOnly, eyetracker.numCalibDots, eyetracker.dotDuration, eyetracker.CALIBRATION_COLOR_SCHEME.background);                           
            });
            
              
        }
      })
      .catch(function (error) {
        console.error(error);        
        eyetracker.error_validation = true;
        helpers.vars.endExperimentButton.html('Error plotting validation.\n Click to restart');
        //restart calibration with the same parameters     
         helpers.vars.endExperimentButton.mousePressed(()=>{remove(); // removes p5js library
                                                            eyetracker.calibrate(eyetracker.return_jsPsych,
                                                            eyetracker.validationOnly, eyetracker.numCalibDots,
                                                            eyetracker.dotDuration, eyetracker.CALIBRATION_COLOR_SCHEME.background);
                                                            }
                                                        );
      });    
  
  }
  
  
// Define the global mousePressed event to be linked to Dot class
// export function mousePressed() {
//     eyetracker.dot.clicked();
//     return false;
// }

export function keyPressed() {

    if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
      //readyUp();
      take_a_break();
    }
  
    return true;
  
}

// callback function for clicking the pauzeButton to take a break
export function take_a_break() {
    helpers.vars.pauzeButton.hide();
    helpers.vars.instructionDiv.hide(); // hide first instruction text    
    fullscreen(true); // set fullscreen if it happenned not to be fullscreen    
    eyetracker.pauze = false;
    eyetracker.startStaticDot=true;
    eyetracker.prevTime = millis();
    eyetracker.dot.visible = true;
    eyetracker.isExperimentOver = false;
        
}

export function welcome_fn() {
    fullscreen(true);
    helpers.vars.welcomeButton.hide();
    helpers.vars.pauzeButton.show();
    helpers.vars.instructionDiv.show();
    helpers.vars.pauzeButton.mousePressed(take_a_break);
   
}

// helper function for drawing text
export function drawText(str, x, y, color){
    textSize(32);
    textAlign(CENTER);
    fill(color);
    text(str, x, y);
}

// helper function for endExperimentButton
export function end_experiment() {

    
    eyetracker.startStaticDot=false;
    eyetracker.dot.visible = false;

    if(done_model_training == true) {
        helpers.vars.endExperimentButton.hide();
      //fullscreen(false); // reduce the screen to normal size
    //   jatos.startNextComponent(system_info); // jatos function to go to the next jatos component
    }
  
}

// helper function proceed to validation
export function next_condition() {

    // while we are taking a break
    eyetracker.startStaticDot = false;
    helpers.vars.endExperimentButton.hide();
    helpers.vars.instructionDiv.show();
    helpers.vars.pauzeButton.show();
    helpers.vars.endExperimentButton.html('VALIDATING...');   
      
}

// helper function to do random choice from an array
export function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}