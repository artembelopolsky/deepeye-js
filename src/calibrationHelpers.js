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
        'system_info': system_info //(screen size, width, etc.)
    }

    var api_creds = document.cookie.split('; ')
    .find(row => row.startsWith('user_token='))
    .split('=')[1];
  
    eyetracker.activeHTTPRequestCounter += 1;

    var headers = {
        'Content-Type': 'application/json',
        'experiment-id' : '../../../data/CalibrationGameJSDataset', // name of data folder on the server (connected to my SciStor)
        'participant-id' : eyetracker.paramHandler.session_timestamp, // participant's session timestamp id, globbally defined in parameters.js
        'type-dataset' : type_dataset, // training or testing calibration dataset
        'final-batch' : eyetracker.final_batch,
        'user-token' : api_creds
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
                    helpers.vars.endExperimentButton.mousePressed(helpers.restart_calibration);  //restart calibration
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
                  helpers.vars.endExperimentButton.mousePressed(helpers.restart_calibration);  //restart calibration
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
        helpers.vars.endExperimentButton.mousePressed(helpers.restart_calibration);  //restart calibration
      });
  
  }

export function plotValidationResults(headers, requestData) {

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
  
        if(json.includes("data:image/jpg;base64,") ) {
          eyetracker.done_validation = true;
          background(255); // set to white
          helpers.vars.endExperimentButton.hide();
          fullscreen(false);      
          noLoop();
        
          document.body.style.overflow = "visible"; // turns the page scroller back on (turned off in html)
          document.getElementById('defaultCanvas0').style.display = 'none'
          document.getElementsByClassName("jspsych-content-wrapper")[0].style.display = "none";

          var div = document.createElement('validationResult');
          div.setAttribute('id', 'validation-result'); 
          document.body.appendChild(div);
          div.innerHTML = eyetracker.validation_html;
                  
          const image = document.getElementById("result-image");
          image.src = json; 

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
            eyetracker.return_jsPsych();}); 
            eyetracker.numCalibrationAttempts = 0; // reset the number of calibration attempts
        
          // Add restart calibration to 'try again' button
          document.getElementById("recalibrate-button").addEventListener("click", ()=> {            
            document.getElementById('validation-result').remove();           
            // new way: show webcam feed during recalibration
            document.getElementById('face-screen').style.display= 'none'; // hide face detection html to keep using video tag during recording            
            remove(); // removes p5js library
            document.getElementById("preloaded-p5js").remove(); // remove html element
            eyetracker.calibrate(eyetracker.return_jsPsych); 
            
            eyetracker.numCalibrationAttempts += 1;
            console.log(`Calibration attempt #: ${eyetracker.numCalibrationAttempts+1}`);
            // if(eyetracker.numCalibrationAttempts == 5) {jatos.endStudy()};
          });
            
              
        }
      })
      .catch(function (error) {
        console.error(error);
        eyetracker.error_validation = true;
        helpers.vars.endExperimentButton.html('Error plotting validation.\n Click to restart');
        helpers.vars.endExperimentButton.mousePressed(helpers.restart_calibration);  //restart calibration
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
      jatos.startNextComponent(system_info); // jatos function to go to the next jatos component
    }
  
}

// helper function proceed to validation
export function next_condition() {

    // while we are taking a break
    eyetracker.startStaticDot = false;
    helpers.vars.endExperimentButton.hide();
    helpers.vars.instructionDiv.show();
    helpers.vars.pauzeButton.show();
    helpers.vars.endExperimentButton.html('Validating...');   
      
}

// helper function to do random choice from an array
export function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}