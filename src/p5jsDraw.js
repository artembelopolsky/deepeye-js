export function draw(){    
  	
    // get global COLOR_SCHEME
    var COLOR_SCHEME = eyetracker.CALIBRATION_COLOR_SCHEME;

    background(COLOR_SCHEME.background);
    eyetracker.dot.col = COLOR_SCHEME.fill;
    eyetracker.type_dataset = eyetracker.CALIBRATION_STEPS[eyetracker.index_conditions];

    if (window.screen.height == window.innerHeight) {
      eyetracker.fullscreen_on = true;
    }
    else {
      eyetracker.fullscreen_on = false;
    }


    eyetracker.FrameDataLog.trialNr = eyetracker.trial+1;
    console.log("Active Requests : ",eyetracker.activeHTTPRequestCounter)
    if (eyetracker.isExperimentOver){
      console.log('Last data recorded')
    }

    if (eyetracker.startStaticDot){
        // upload the frames right away
      if (eyetracker.base64data.length % 10 == 0 && eyetracker.base64data.length > 0) {
        console.log(eyetracker.FrameDataLog.dotNr)
        console.log((eyetracker.dot.LOCATIONS.length-1))
        // upload frames for all dots, stop after the last dot
        if (eyetracker.FrameDataLog.dotNr < (eyetracker.dot.LOCATIONS.length+1)){
            helpers.uploadData(eyetracker.base64data.splice(0, eyetracker.base64data.length), eyetracker.type_dataset);
        }
        else if(eyetracker.FrameDataLog.dotNr == (eyetracker.dot.LOCATIONS.length + 1)){
          eyetracker.requestcounter ++;
          eyetracker.final_batch = true;
          helpers.uploadData(eyetracker.base64data.splice(0, eyetracker.base64data.length), eyetracker.type_dataset, eyetracker.final_batch); // label as the last batch
        }
      }

      noCursor();
            
      console.log('Dot visible : ',eyetracker.dot.visible);
      console.log('num Dots : ', eyetracker.num_dots);
      // console.log('total dots : ',eyetracker.dot.config.total_dots*2)

      if (eyetracker.dot.visible && eyetracker.num_dots<eyetracker.dot.config.total_dots*2){

        eyetracker.dot.pulsate();
        eyetracker.dot.show('circle');

        eyetracker.timestamp = millis();

        eyetracker.FrameDataLog.timestamp = eyetracker.timestamp;
        eyetracker.FrameDataLog.x = eyetracker.dot.x;
        eyetracker.FrameDataLog.y = eyetracker.dot.y;
        eyetracker.FrameDataLog.dotColor = eyetracker.dot.col;
        eyetracker.FrameDataLog.dotNr = Math.floor((eyetracker.num_dots+1)/2) +1;
        eyetracker.FrameDataLog.corrResp = eyetracker.dot.correct_resp;
        eyetracker.frameCount = frameCount;
        console.log('eyetracker.dotxy:', eyetracker.dot.x, eyetracker.dot.y)
        // console.log('frame count : ', eyetracker.frameCount)
        // console.log('eytracker timestamp : ',eyetracker.timestamp)
        console.log(eyetracker.prevTime + eyetracker.dot.config.delayWebcamCapture)

        if(eyetracker.frameCount%2==0) {
          // start saving frames only after a delay from when the dot is presented
          if(eyetracker.timestamp > eyetracker.prevTime + eyetracker.dot.config.delayWebcamCapture){
            // console.log(`CAPTURING FRAMES ${millis()}, prevTime ${eyetracker.prevTime}`);
            helpers.captureFrames(eyetracker.FrameDataLog);
          }
        }
      }
      if(millis() > eyetracker.prevTime + eyetracker.dot.config.dotDuration - eyetracker.deductTime){
        // keeps track of time interval
        // every dotDuration the dot cycles between visible and invisible

        eyetracker.prevTime = millis(); // reset the timer
        eyetracker.dot.visible=!eyetracker.dot.visible; // eyetracker flips the dot visibility

        if(eyetracker.dot.visible){
          eyetracker.deductTime = 0; // nothing subtracted from dot duration time
          
          if(Math.floor((eyetracker.num_dots+1)/2 - 1) < eyetracker.dot.LOCATIONS.length) {

            eyetracker.dot.x = eyetracker.dot.LOCATIONS[(Math.floor((eyetracker.num_dots+1)/2)-1)].x; 
            eyetracker.dot.y = eyetracker.dot.LOCATIONS[(Math.floor((eyetracker.num_dots+1)/2)-1)].y;
            
          }

          eyetracker.dot.col_bulls_eye = COLOR_SCHEME.color_bulls_eye; // reset bull's eye color after every dot move
          eyetracker.dot.correct_resp = -1; // reset response after every dot move
          eyetracker.dot.move(eyetracker.dot.x, eyetracker.dot.y);
        }
        else {
          eyetracker.deductTime = eyetracker.dot.config.dotDuration - eyetracker.dot.config.dotAbsenceDuration; // time difference between dot presence duration and dot absence duration
        }

        if(eyetracker.num_dots < eyetracker.dot.config.total_dots*2){
          // keep track of how many dots were shown per trial
          eyetracker.num_dots += 1;
        }

        if(eyetracker.num_dots == eyetracker.dot.config.total_dots*2){
          // if all dots in the trial sequence have been shown
          

          if(eyetracker.trial < eyetracker.dot.config.total_trials-1){
            eyetracker.num_dots = 0; // restart the dot sequence if not all trials are done
            eyetracker.trial += 1; // increase trial counter
            eyetracker.pauze = true; // take a break
          }
          else {
          if(eyetracker.index_conditions < eyetracker.CALIBRATION_STEPS.length ) { // typically 2: calibration, then validation
            eyetracker.index_conditions += 1; // go to the next condition in the EXPERIMENT object
            eyetracker.base64data = []; // remove the remaining logs that were not transfered
            eyetracker.num_dots = 0;
            eyetracker.trial = 0; // reset the current trial number
            eyetracker.pauze = true; // take a break
            eyetracker.dot.x = window.screen.width/2; // reset first dot position to the center
            eyetracker.dot.y = window.screen.height/2;
            shuffle(eyetracker.dot.LOCATIONS, true); // shuffle static dot location inplace
          }
          // eyetracker.pauze = true;
          }
        }
      }

      if (eyetracker.pauze){
        background(COLOR_SCHEME.background); // clear the screen

        if(eyetracker.index_conditions == eyetracker.CALIBRATION_STEPS.length) { 

          /// when the end of calibration procedure is reached show eyetracker button
          
          helpers.vars.endExperimentButton.show();
          cursor(); // show mouse cursor if hidden
          helpers.vars.endExperimentButton.mousePressed(helpers.end_experiment);          
          eyetracker.isExperimentOver = true;
          eyetracker.startStaticDot = false;
                   
        }
        else {
          // when the end of calibration procedure is reached show eyetracker button
          
          helpers.vars.endExperimentButton.show();
          cursor(); // show mouse cursor if hidden
          //helpers.vars.endExperimentButton.mousePressed(helpers.end_experiment);          
          eyetracker.isExperimentOver = true;
          eyetracker.startStaticDot = false;
          helpers.vars.pauzeButton.html('START VALIDATION');
          helpers.vars.pauzeButton.mousePressed(helpers.take_a_break);





          
          
          // helpers.vars.instructionDiv.html(INSTRUCTIONS[condition]); // change the text according to condition
          // helpers.vars.instructionDiv.style('color', color(COLOR_SCHEME.textStrokeColor));
          // helpers.vars.instructionDiv.show();

          // helpers.vars.pauzeButton.html('CLICK to CONTINUE');
          // helpers.vars.pauzeButton.style('cursor', ARROW); // reset cursor over button
          // helpers.vars.instructionDiv.style('cursor', ARROW); // reset cursor over text
          // cursor(); // show mouse cursor if hidden
          eyetracker.dot.visible = true; // reset so that the dot is visible right away and the data is uploaded after the dot dissappears
          eyetracker.dot.col_bulls_eye = COLOR_SCHEME.color_bulls_eye; // reset to the current color scheme.

          //helpers.vars.pauzeButton.show();
          //helpers.vars.pauzeButton.mousePressed(take_a_break);
    
        }
      }
    }
}