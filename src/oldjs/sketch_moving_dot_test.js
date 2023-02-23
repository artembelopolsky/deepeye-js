/*
Copyright Artem Belopolsky 21-4-2022
*/


/*
Declare defaults
*/


const BLACK_ON_GREY = {
    fill: 0,
    background: 160,
    textStrokeWeight: 3,
    textStrokeColor: [0, 0, 0],
    color_bulls_eye: 255
}

const GREY_ON_BLACK = {
    fill: 200,
    background: 0,
    textStrokeWeight: 3,
    textStrokeColor: [255, 255, 255],
    color_bulls_eye: 0
}

const INSTRUCTIONS = {
    'static_dot' : 'During this trial, dots will appear one by one on your screen.\n \
     Click on the center of each dot as fast and as accurate as possible.',
    'moving_dot' : 'During this trial, you will see a moving dot on your screen.\n \
     Follow the dot with your eyes. When a ← or → appears on the dot,\n press the button with the same arrow on your keyboard\n as fast and as accurate as possible.\n'
}

//default experiment configs
var staticDotConfig = {
    total_trials: 1,
    dotDuration: 2300, // time dot is present
    dotAbsenceDuration: 1000, // time dot is absent
    total_dots: 25,
    dot_diam_max: 50,
    dot_diam_min: 18,
    style: GREY_ON_BLACK,
    delayWebcamCapture: 800 // time between dot presentation and start of frame capture
}

var movingDotConfig = {
    total_trials: 1,
    segmentDuration: 4000, // dot without an arrow
    arrowDuration: 2500,  // arrow presentation duration
    num_bounces_per_side: 3,
    step_size_x: 7,
    dot_diam_max: 50,
    dot_diam_min: 18,
    style: GREY_ON_BLACK
}


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

/*
Declare global variables
*/
let dotVisible = true; // flag to set dot to visible or invisible, linked to dotDuration
let randomX; // randomX dot location
let randomY; // randomY dot location
let prevTime; // start timer
let num_dots = 0; // counter for the number of dots per trial
let trial = 0; // counter for the number of trials
// var readyButton; // button to start experiment
var pauzeButton; // button to start next trial
var endExperimentButton; // button to show at the end of experiment
var welcomeButton;
var instructionDiv; // text divisor for the instruction text
var ready = false; // controls trial events
var pauze = false; // controls taking a break after trial
let dot; // dot object
var first = 'true';
var requestcounter =0;

let start_move_pos_x = movingDotConfig.dot_diam_max/2;
let start_move_pos_y = movingDotConfig.dot_diam_max/2;
let reverse = false;
let stop_moving = false;
let deductTime = 0;
let target_type = 'none';
let show_arrow = false;
let reset_color = 'white';
let reset_corr_resp = 0;
let targ_color;
// let first_resp_press = false;
let count_corr_resp_per_trial = 0;
let step_size_y;
let random_factor;
let count_arrows_per_trial=0;
let COLOR_SCHEME;
let COLOR_SCHEMES = [];
let CONDITIONS = []
let condition = 'moving_dot';
let EXPERIMENT;
let index_conditions = 0; // to loop thru conditions in the experiment
let fullscreen_on = false;

// Webcam related
let base64data = [];
var video;
var stream;
var videoSettings;
var timestamp;
let session_timestamp = localStorage.getItem('session_timestamp');
// let max_num_frames = 150;
// let frames_per_upload = 30;
let num_upload = 0;
let frameNr= -1; // count frames throughout the session

// const BASE_URL = "http://127.0.0.1:5000"; // local server
const BASE_URL = "https://deepeye.labs.vu.nl/firebase";

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


  fetch(BASE_URL + "/calibrate", {
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

      })
      .catch(function (error) {

      });
}


// Define dot class
class Dot {
  constructor(x, y, diam1=18, diam2=50, col=0, col_bulls_eye=255) {
    this.x = x;
    this.y = y;
    this.diam1 = diam1;
    this.diam2 = diam2;
    this.col = col;
    this.col_bulls_eye = col_bulls_eye;
    this.correct_resp = -1;
    this.key_pressed_already = false;
    this.key = false;
  }

  show(type='none') {

    noStroke();
    fill(this.col);
    circle(this.x, this.y, this.diam1);

    if(type=='circle') {
      fill(this.col_bulls_eye);
      circle(this.x, this.y, this.diam1/4);
    }
    else if(type=='left_arrow') {

      fill(this.col_bulls_eye);
      textSize(25);
      textStyle(BOLD);
      text("←", this.x-11, this.y+7);
    }
    else if(type=='right_arrow') {

      fill(this.col_bulls_eye);
      textSize(25);
      textStyle(BOLD);
      text("→", this.x-11, this.y+7);
    }


  }

  pulsate() {
    if (this.diam1 < this.diam2){
      this.diam1 = this.diam1 + 1;
    }
    else if (this.diam1 == this.diam2){
      this.diam1 = staticDotConfig.dot_diam_min;
    }
  }

  move(x, y) {

    //this.correct_resp = reset_corr_resp;
    this.x = x;
    this.y = y;
  }

  clicked() {
    var d = dist(mouseX, mouseY, this.x, this.y);
    fullscreen(true); // set fullscreen if it happenned not to be fullscreen

    if(d < this.diam2/2){
      this.col_bulls_eye = color(50, 200, 0);
      this.correct_resp = 1;
    }
  }

}

// Define the global mousePressed event to be linked to Dot class
function mousePressed() {
  dot.clicked();
  return false;
}


function keyPressed() {

  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    //readyUp();
    take_a_break();
  }

  return true;

}

// callback function for clicking the pauzeButton to take a break
function take_a_break() {
  pauzeButton.hide();
  instructionDiv.hide(); // hide first instruction text
  pauze = false;
  ready=true;
  prevTime = millis();
}

function welcome_fn() {
  fullscreen(true);
  welcomeButton.hide();
  pauzeButton.show();
  instructionDiv.show();
  pauzeButton.mousePressed(take_a_break);
  if(EXPERIMENT[0].condition == 'moving_dot') {
    pauzeButton.style('cursor','none');
    instructionDiv.style('cursor','none');
    noCursor();


  }
}

// helper function for drawing text
function drawText(str, x, y, color){
  textSize(32);
  textAlign(CENTER);
  fill(color);
  text(str, x, y);
}

// helper function for endExperimentButton
function end_experiment() {
  endExperimentButton.hide();
  fullscreen(false); // reduce the screen to normal size
  //window.location.href = '../image_gallery';
  jatos.endStudy(system_info); // jatos function to finish the experiment
  //jatos.startNextComponent(system_info); // jatos function to go to the next jatos component

}

// helper function to do random choice from an array
function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}


/*
Core functions setup() and draw() from p5js
setup() is used to premake objects in advance
draw() is constantly looping at frameRate(), typicaly 60Hz
*/


function setup(){
  let bounce_height, num_steps_x;

  pixelDensity(1);
  createCanvas(window.screen.width, window.screen.height);
  frameRate(60);

  // set up conditions
  COLOR_SCHEMES = [BLACK_ON_GREY, GREY_ON_BLACK]; // possible color schemes
  //shuffle(COLOR_SCHEMES, true); // shuffle array in place
  CONDITIONS = ['moving_dot', 'static_dot']; // possible conditions
  //shuffle(CONDITIONS, true); // shuffle array in place

  // assign shuffled conditions such that color scheme changes second half of the experiment
  // and the condition changes each quarter in the same order
  EXPERIMENT = [
        {condition: CONDITIONS[0], col_scheme: COLOR_SCHEMES[0]},
        //{condition: CONDITIONS[1], col_scheme: COLOR_SCHEMES[0]},
        //{condition: CONDITIONS[0], col_scheme: COLOR_SCHEMES[1]},
        //{condition: CONDITIONS[1], col_scheme: COLOR_SCHEMES[1]}
      ];

  welcomeButton = createButton('START EXPERIMENT');
  welcomeButton.style('color', color(25, 23, 200));
  welcomeButton.size(window.screen.width/4, window.screen.width/5/3);
  welcomeButton.style("font-family", "Comic Sans MS");
  welcomeButton.style("font-size", "25px");
  welcomeButton.position(window.screen.width/2, window.screen.height-window.screen.height/3);
  welcomeButton.center('horizontal');

  welcomeButton.mousePressed(welcome_fn);

  instructionDiv = createDiv(INSTRUCTIONS[EXPERIMENT[0].condition]);
  instructionDiv.style('font-size', '32px');
  instructionDiv.style('color', color(EXPERIMENT[0].col_scheme.textStrokeColor));
  instructionDiv.size(window.screen.width/3, window.screen.height/3);
  instructionDiv.position(window.screen.width/2, window.screen.height/4);
  instructionDiv.center('horizontal');
  instructionDiv.hide();


  if(EXPERIMENT[0].condition == 'static_dot') {
    pauzeButton = createButton('CLICK to CONTINUE');
  }
  else {
    pauzeButton = createButton('PRESS "←" or "→" to CONTINUE');

  }

  pauzeButton.size(window.screen.width/5, window.screen.width/5/3);
  pauzeButton.style('color', color(25, 23, 200));
  pauzeButton.style("font-family", "Comic Sans MS");
  pauzeButton.style("font-size", "25px");
  pauzeButton.position(window.screen.width/2, window.screen.height-window.screen.height/3);
  pauzeButton.center('horizontal');
  pauzeButton.hide();

  endExperimentButton = createButton('Task completed.\nThank you for participation.');
  endExperimentButton.size(600, 300);
  endExperimentButton.style('color', color(25, 23, 200));
  endExperimentButton.style("font-family", "Comic Sans MS");
  endExperimentButton.style("font-size", "48px");
  endExperimentButton.center();
  endExperimentButton.hide();

  createCanvas(window.screen.width, window.screen.height);
  background(EXPERIMENT[0].col_scheme.background);

  // webcam device, use the id for integrated webcam, if set in head_position.js
  navigator.mediaDevices.getUserMedia({ video: { deviceId: localStorage.getItem("id_webcam") } })
    .then(function (mediaStream) {
        stream = mediaStream;
        video = document.getElementById("video");
        video.srcObject = mediaStream;
        videoSettings = mediaStream.getVideoTracks()[0].getSettings();

    });

  bounce_height = (window.screen.height-movingDotConfig.dot_diam_max)/(movingDotConfig.num_bounces_per_side*2); //y-distance per bounce on one side
  num_steps_x = (window.screen.width-movingDotConfig.dot_diam_max)/movingDotConfig.step_size_x; // number of steps to complete x-distance
  step_size_y = bounce_height/num_steps_x; // size of step in y direction in pixels
  start_move_pos_x = randomChoice([movingDotConfig.dot_diam_max/2, (window.screen.width-movingDotConfig.dot_diam_max/2)]);


  console.log(`Bounce height: ${bounce_height}`);
  console.log(`num_steps_x: ${num_steps_x}`);
  console.log(`step_size_y: ${step_size_y}`);

  //get a random location for the dot in static condition and move the dot there
  randomX = random(staticDotConfig.dot_diam_max, window.screen.width-staticDotConfig.dot_diam_max); // pick random dot location, but make sure dot is fully visible on the screen
  randomY = random(staticDotConfig.dot_diam_max, window.screen.height-staticDotConfig.dot_diam_max);


  dot = new Dot(randomX, randomY, staticDotConfig.dot_diam_min, staticDotConfig.dot_diam_max,
                col=255, col_bulls_eye=EXPERIMENT[0].col_scheme.color_bulls_eye); // get instance of dot class with settings for upcoming trial


}

function draw(){

  condition = EXPERIMENT[index_conditions].condition;
  COLOR_SCHEME = EXPERIMENT[index_conditions].col_scheme;
  background(COLOR_SCHEME.background);
  dot.col = COLOR_SCHEME.fill;
  console.log(`Ready: ${ready}`);
  print(`Condition index: ${index_conditions}`);
  //console.log(`windowWidth = ${window.screen.width}, windowHeight = ${window.screen.height}`);
  if (window.screen.height == window.innerHeight) {
    fullscreen_on = true;
  }
  else {
    fullscreen_on = false;
  }
  console.log(`fullscreen: ${fullscreen_on}`);

  if(ready){
    // while trial is going

    //text(frameCount, width / 2, height / 2); //display frame counter
    //drawText(`Trial ${trial+1}`, window.screen.width/2, window.screen.height-100, COLOR_SCHEME.textStrokeColor);
    console.log(`Trial ${trial+1}`);
    console.log(`Key: ${key}`);
    console.log(`Total correct responses: ${count_corr_resp_per_trial}`);
    console.log(`Total arrows per trial: ${count_arrows_per_trial}`);

    FrameDataLog.condition = condition;
    FrameDataLog.trialNr = trial+1;
    FrameDataLog.fullscreen_on = fullscreen_on;

    if(condition == 'moving_dot'){
      // send every 10 frames to GCP
      if (base64data.length % 10 == 0 && base64data.length > 0) {

        // skip first 30 frames
        if (requestcounter==4){
            uploadData(base64data.splice(0, base64data.length));
        }
        else {
          base64data.splice(0, base64data.length); // erase the frames
        }
        requestcounter ++;
      }
      // if (base64data.length % 10 == 0 && base64data.length > 0) {
      //   // skip first 30 frames, collect 10 frames
      //   if (requestcounter==4){
      //       uploadData(base64data.splice(0, base64data.length));
      //       //first = 'false'
      //   }
      //   else {
      //     base64data.splice(0, base64data.length); // erase the frames
      //   }
      //   requestcounter ++;
      // }


      noCursor(); // hide mouse cursor

      dot.move(start_move_pos_x, start_move_pos_y); // reset the dot to new position at the start of the draw loop to avoid carryover from different conditions
      dot.pulsate();
      dot.show(type=target_type);

      timestamp = millis();

      print(`StartTrial: ${timestamp}`);
      // captureFrames(FrameDataLog);

      console.log(`Dot position: ${start_move_pos_x},${start_move_pos_y}`);
      dot.correct_resp = -1;
      console.log(`Show_arrow: ${show_arrow}`);


      if(start_move_pos_x + movingDotConfig.dot_diam_max/2 > window.screen.width ||
        start_move_pos_x - movingDotConfig.dot_diam_max/2 < 0) {

        reverse =! reverse;
      }

      if(reverse == false) {
        start_move_pos_x += movingDotConfig.step_size_x;
        start_move_pos_y += step_size_y;
      }
      else if(reverse == true){
        start_move_pos_x -= movingDotConfig.step_size_x;
        start_move_pos_y += step_size_y;
      }


      if(start_move_pos_y + movingDotConfig.dot_diam_max/2 > window.screen.height) {

        // when dot reaches the bottom of the screen
        print(`EndTrial: ${millis()}`);
        uploadData(base64data.splice(0, base64data.length), final_batch=true); // upload all remaining frames to server

        if(trial < movingDotConfig.total_trials-1){
          trial += 1; // increase trial counter
          count_corr_resp_per_trial = 0; // reset counter

          // randomly choose moving dot starts left or right side of the screen
          start_move_pos_x = randomChoice([movingDotConfig.dot_diam_max/2, (window.screen.width-movingDotConfig.dot_diam_max/2)]);
          if(start_move_pos_x == movingDotConfig.dot_diam_max/2) {
            reverse = false;
          }
          else {
            reverse = true;
          }

          // restart the trial with the dot on the top of the screen
          start_move_pos_y = movingDotConfig.dot_diam_max/2;

          prevTime = millis(); //reset the timer
          target_type = 'none'; // reset the dot, remove the arrow
          count_arrows_per_trial = 0; // reset counter
          pauze = true; // take a break

        }
        else {
          //dot.col = COLOR_SCHEME.background; // erase the dot
          if(index_conditions < EXPERIMENT.length) {
            index_conditions += 1; // go to the next condition in the EXPERIMENT object
            trial = 0; // reset the current trial number

            // restart the moving dot trial from the top
            start_move_pos_x = randomChoice([movingDotConfig.dot_diam_max/2, (window.screen.width-movingDotConfig.dot_diam_max/2)]);
            start_move_pos_y = movingDotConfig.dot_diam_max/2;
            prevTime = millis(); //reset the timer
            target_type = 'none'; // reset the dot, remove the arrow
            count_arrows_per_trial = 0; // reset counter
            pauze = true; // take a break
          }
        }
      }

      if(show_arrow == false) {
        key = false;
        // dot.col_bulls_eye = 255;
        dot.col_bulls_eye = COLOR_SCHEME.color_bulls_eye;
        dot.correct_resp = -1;
      }


      random_factor = random(0, 4000);
      if(millis() > (prevTime + (movingDotConfig.segmentDuration+random_factor) - deductTime)){
        // keeps track of time interval, is executed only at certain times
        show_arrow = !show_arrow;  //alternate setting for showing or not showing arrow
        target_type = randomChoice(['left_arrow', 'right_arrow']); // randomly pick arrow orientation
        prevTime = millis(); //reset the timer
        if(show_arrow == true) {
          count_arrows_per_trial +=1;
          deductTime = movingDotConfig.segmentDuration - movingDotConfig.arrowDuration; // makes presentation time when arrow is presented this much shorter than when no arrow is presented
                            // otherwise the segments without the arrow and with the arrow have exactly the same duration

        }
        else {
          deductTime = 0;
          target_type = 'none';
        }
      }

      if(show_arrow == true) {
        if(key == 'ArrowLeft' && dot.col_bulls_eye == COLOR_SCHEME.color_bulls_eye) {
          if(target_type == 'left_arrow') {
            dot.correct_resp = 1;
            dot.col_bulls_eye = color(50, 200, 0);
          }
          else if(target_type == 'right_arrow') {
            dot.correct_resp = 0;
            dot.col_bulls_eye = color(200, 50, 0);
          }
        }
        if(key == 'ArrowRight' && dot.col_bulls_eye == COLOR_SCHEME.color_bulls_eye) {
          if(target_type == 'right_arrow') {
            dot.correct_resp = 1;
            dot.col_bulls_eye = color(50, 200, 0);
          }

          else if(target_type == 'left_arrow') {
            dot.correct_resp = 0;
            dot.col_bulls_eye = color(200, 50, 0);
          }

        }
        if(dot.correct_resp == 1) {
          count_corr_resp_per_trial += 1;
        }

      }
      console.log(`Bull's eye color: ${dot.col_bulls_eye}`);
      console.log(`Response: ${dot.correct_resp}`);

      FrameDataLog.timestamp = timestamp;
      FrameDataLog.x = start_move_pos_x;
      FrameDataLog.y = start_move_pos_y;
      FrameDataLog.dotColor = dot.col;
      FrameDataLog.dotNr = -1;
      FrameDataLog.showArrow = show_arrow;
      FrameDataLog.target_type = target_type;
      FrameDataLog.corrResp = dot.correct_resp;
      FrameDataLog.respKey = key;

      // capture frames at half the display frame rate
      if(frameCount%2==0) {
        captureFrames(FrameDataLog);
      }
    }
    else {
    // static dot condition

      cursor(); // show mouse cursor for the static dot condition
      if(dotVisible && num_dots<staticDotConfig.total_dots*2){

        // shows the dot

        dot.pulsate();
        dot.show(type='circle');

        timestamp = millis();
        print(`StartTrial: ${timestamp}`);

        FrameDataLog.timestamp = timestamp;
        FrameDataLog.x = randomX;
        FrameDataLog.y = randomY;
        FrameDataLog.dotColor = dot.col;
        FrameDataLog.dotNr = (Math.floor((num_dots+1)/2)+1);
        FrameDataLog.corrResp = dot.correct_resp;
        // capture frames at half the presentation rate
        if(frameCount%2==0) {
          // start saving frames only after a delay from when the dot is presented
          if(timestamp > prevTime + staticDotConfig.delayWebcamCapture){
            console.log(`CAPTURING FRAMES ${millis()}, prevTime ${prevTime}`);
            captureFrames(FrameDataLog);
          }
        }

        console.log(`Dot number: ${(Math.floor((num_dots+1)/2)+1)}`); // convert dot number from 0,2,4... to 1,2,3
        console.log(`Dot position: ${randomX},${randomY}`);
        console.log(`Dot onset time: ${timestamp}`);
        console.log(`Response: ${dot.correct_resp}`);

      }
      if (dotVisible == false && base64data.length > 0) {
        print(`base64len: ${base64data.length}`);
        uploadData(base64data.splice(0, base64data.length));
      }


      if(millis() > prevTime + staticDotConfig.dotDuration - deductTime){
        // keeps track of time interval
        // every dotDuration the dot cycles between visible and invisible

        prevTime = millis(); // reset the timer
        dotVisible=!dotVisible; // this flips the dot visibility

        if(dotVisible){
          deductTime = 0; // nothing subtracted from dot duration time
          //get new random location for the dot and move the dot there
          randomX = random(staticDotConfig.dot_diam_max, window.screen.width-staticDotConfig.dot_diam_max); // pick random dot location, but make sure dot is fully visible on the screen
          randomY = random(staticDotConfig.dot_diam_max, window.screen.height-staticDotConfig.dot_diam_max);

          dot.col_bulls_eye = COLOR_SCHEME.color_bulls_eye; // reset bull's eye color after every dot move
          dot.correct_resp = -1; // reset response after every dot move
          dot.move(randomX, randomY);
        }
        else {
          deductTime = staticDotConfig.dotDuration - staticDotConfig.dotAbsenceDuration; // time difference between dot presence duration and dot absence duration
        }

        if(num_dots < staticDotConfig.total_dots*2){
          // keep track of how many dots were shown per trial
          num_dots += 1;
        }

        if(num_dots == staticDotConfig.total_dots*2){
          // if all dots in the trial sequence have been shown

          if(trial < staticDotConfig.total_trials-1){
            num_dots = 0; // restart the dot sequence if not all trials are done
            trial += 1; // increase trial counter
            pauze = true; // take a break
          }
          else {
            if(index_conditions < EXPERIMENT.length) {
              index_conditions += 1; // go to the next condition in the EXPERIMENT object
              num_dots = 0;
              trial = 0; // reset the current trial number
              pauze = true; // take a break
            }
          }
        }
      }
    }


  }

  if(pauze) {

    background(COLOR_SCHEME.background); // clear the screen

    if(index_conditions == EXPERIMENT.length) {
      // when the end of experiment is reached show this button
      endExperimentButton.show();
      cursor(); // show mouse cursor if hidden
      endExperimentButton.mousePressed(end_experiment);
    }
    else {
      // while we are taking a break
      ready = false;
      instructionDiv.html(INSTRUCTIONS[condition]); // change the text according to condition
      instructionDiv.style('color', color(COLOR_SCHEME.textStrokeColor));
      instructionDiv.show();
      if(condition == 'moving_dot') {
        pauzeButton.html('PRESS "←" or "→" to CONTINUE');
        pauzeButton.style('cursor','none');
        instructionDiv.style('cursor', 'none');
        noCursor();
      }
      else {
        pauzeButton.html('CLICK to CONTINUE');
        pauzeButton.style('cursor', ARROW); // reset cursor over button
        instructionDiv.style('cursor', ARROW); // reset cursor over text
        cursor(); // show mouse cursor if hidden
        dotVisible = true; // reset so that the dot is visible right away and the data is uploaded after the dot dissappears
        dot.col_bulls_eye = COLOR_SCHEME.color_bulls_eye; // reset to the current color scheme.

      }
      pauzeButton.show();
      pauzeButton.mousePressed(take_a_break);

    }
  }

}
