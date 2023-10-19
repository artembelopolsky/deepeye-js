
// import "main.js"

var jsPsych = initJsPsych({     
    on_finish: () => window.location.href = "https://deepeye-swarm.vu.nl/"
  });


  /* create timeline */
  var timeline = [];

        
  var setup_eyeTracker = {
      type: jsPsychCallFunction,
      async: true,
      func: function(done){

        eyetracker.setup(done);
        
        
      }
    }
   
          
  timeline.push(setup_eyeTracker);

  var calibrate = {
      type: jsPsychCallFunction,
      async: true,
      func: function(done){
        eyetracker.calibrate(done, undefined, numCalibDots=13);        
      }
    }
   
          
  timeline.push(calibrate);
  
  jsPsych.run(timeline);      