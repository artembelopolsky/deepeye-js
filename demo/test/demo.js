
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

        eyetracker.api_token = 'B79QS8X5hI77bcUKvyt57vcVtpDfvrXRcR4mDU04iDp2v47lZmN506SPOPJ9';
        eyetracker.setup(done);
        // window.helpers.testDownloadSpeed()
        
        
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