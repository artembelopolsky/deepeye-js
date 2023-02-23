
export function displayWelcomeBtn(){
  helpers.vars.welcomeButton = createButton('START EXPERIMENT');
  helpers.vars.welcomeButton.size(window.screen.width/4, window.screen.width/5/3);
  helpers.vars.welcomeButton.style('color', color(25, 23, 200));
  helpers.vars.welcomeButton.style("font-family", "Comic Sans MS");
  helpers.vars.welcomeButton.style("font-size", "25px");
  helpers.vars.welcomeButton.position(window.screen.width/2, window.screen.height-window.screen.height/3);
  helpers.vars.welcomeButton.center('horizontal');
  helpers.vars.welcomeButton.mousePressed(window.helpers.welcome_fn);
  // helpers.vars.welcomeButton.hide();
  
  
}

export function displayInstructions(){
  helpers.vars.instructionDiv = createDiv(window.params.INSTRUCTIONS['static_dot']);
  helpers.vars.instructionDiv.style('font-size', '32px');
  helpers.vars.instructionDiv.style('color', color(window.params.BLACK_ON_GREY.textStrokeColor));
  helpers.vars.instructionDiv.size(window.screen.width/3, window.screen.height/3);
  helpers.vars.instructionDiv.style('line-height', 1.8);
  helpers.vars.instructionDiv.position(window.screen.width/2, window.screen.height/4);
  helpers.vars.instructionDiv.center('horizontal');
  // helpers.vars.instructionDiv.hide();
}

export function displayPauzeBtn(){

  
  if (eyetracker.CALIBRATION_STEPS.length == 1) {
    helpers.vars.pauzeButton = createButton('START VALIDATION'); // if validation only
  }
  else {
    helpers.vars.pauzeButton = createButton('START CALIBRATION');
  }
  helpers.vars.pauzeButton.size(window.screen.width/5, window.screen.width/5/3);
  helpers.vars.pauzeButton.style('color', color(25, 23, 200));
  helpers.vars.pauzeButton.style("font-family", "Comic Sans MS");
  helpers.vars.pauzeButton.style("font-size", "25px");
  helpers.vars.pauzeButton.position(window.screen.width/2, window.screen.height-window.screen.height/3);
  helpers.vars.pauzeButton.center('horizontal');
  // helpers.vars.pauzeButton.hide();
  
 
  helpers.vars.pauzeButton.mousePressed(window.helpers.take_a_break);
}

export function displayEndExperimentBtn(){

  if (eyetracker.CALIBRATION_STEPS.length == 1) {
    helpers.vars.endExperimentButton = createButton('Validating...'); // if validation only
  }
  else {
    helpers.vars.endExperimentButton = createButton('Calibrating...');
  }
  
  helpers.vars.endExperimentButton.size(600, 300);
  helpers.vars.endExperimentButton.style('color', color(25, 23, 200));
  helpers.vars.endExperimentButton.style("font-family", "Comic Sans MS");
  helpers.vars.endExperimentButton.style("font-size", "48px");
  helpers.vars.endExperimentButton.style('line-height', 1.8);
  helpers.vars.endExperimentButton.center();
  helpers.vars.endExperimentButton.hide();
}
  

export function setup(){
  
  pixelDensity(1);
  createCanvas(window.screen.width, window.screen.height);
  frameRate(60);
  
  // do all the setup for calibration and recalibration (called in validation results)
  resetSetup();  

}

// set/reset all the calibration variables to restart calibration
export function resetSetup() {

  // background(params.BLACK_ON_GREY.background);
    
  eyetracker.index_conditions = 0; // go to the next condition in the EXPERIMENT object
  eyetracker.base64data = []; // remove the remaining logs that were not transfered
  eyetracker.num_dots = 0;
  eyetracker.trial = 0; // reset the current trial number
  eyetracker.pauze = true; // take a break

  // display messages  
  eyetracker.p5setup.displayInstructions();
  eyetracker.p5setup.displayPauzeBtn();  
  eyetracker.p5setup.displayEndExperimentBtn();     


  //get new predefined dot location for static condition
  helpers.vars.randomX = window.screen.width/2;
  helpers.vars.randomY = window.screen.height/2;  

  // get instance of dot class with settings for upcoming trial  
  eyetracker.dot = new Dot(helpers.vars.randomX, helpers.vars.randomY, 18, 50, 0, 255, eyetracker.numCalibDots); 

  shuffle(eyetracker.dot.LOCATIONS, true); // shuffle static dot location inplace

}