# deepeyetracker-js

Javascript library for gathering eyetracking data from webcam in the browser and comminicating with the Deepeye-API. 

## Usage 

Either use a script tag in html :
```
<script src="https://deepeye.labs.vu.nl/resources/deepeyetracker.js"></script>
```

or build locally : 
```
nmp install && npm run build
```

Our code depends on faceapi-js and p5.js. So to use the script tag, you need to load additional resources:
(the faceapi-js models and our own verion of p5js with minor changes that allow for better integration with JSpsych)

```
<script src="https://deepeye.labs.vu.nl/resources/models/face_landmark_68_model-shard1"></script>
<script src="https://deepeye.labs.vu.nl/resources/models/face_landmark_68_model-weights_manifest.json"></script>
<script src="https://deepeye.labs.vu.nl/resources/models/tiny_face_detector_model-shard1"></script>
<script src="https://deepeye.labs.vu.nl/resources/models/tiny_face_detector_model-weights_manifest.json"></script>
<link rel="preload" href="https://deepeye.labs.vu.nl/resources/dependencies/p5.min_mod.js" as="script"></link>
```

### Basic functionality. 

In our current approach we use the jsPsych library to create experiments in the browser. See https://www.jspsych.org/ or https://github.com/jspsych/jsPsych.git for more info on jsPsych.

After loading our library, their are 2 methods of the eyetracker object you are most likely to use : eyetracker.calibrate() and eyetracker.record()

See example code below : 

```
var jsPsych = initJsPsych({     
    on_finish: () => window.location.href = "https://deepeye-swarm.vu.nl/"
  });


  /* create timeline */
  var timeline = [];

        
  var setup_eyeTracker = {
      type: jsPsychCallFunction,
      async: true,
      func: function(done){

        eyetracker.api_token = '<Your deepeye study token>';
        eyetracker.setup(done);
        // window.helpers.testDownloadSpeed()
        
        
      }
    }
   
          
  timeline.push(setup_eyeTracker);

  var calibrate = {
      type: jsPsychCallFunction,
      async: true,
      func: function(done){
        eyetracker.calibrate(done, undefined, numCalibDots=9);        
      }
    }
   
          
  timeline.push(calibrate);
  
  jsPsych.run(timeline);    
```

The deepeye token in the above code can be acquired by creating a account at https://deepeye-swarm.psy.vu.nl/. You get a free demo token that will allow you to test our API. 

Then finally it is possible to add any kind of data about experimental condition,trial number etcetera to your eyetracking data via the eyetracker.FrameDataLog. This is a object that by default contains following data: 
```
eyetracker.FrameDataLog = {
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
    respTime: -1,
    mouseXY: -1,
    target_type: -1,
    fullscreen_on: -1,
    frameNr:-1,
    numCalibDots:-1,
    pp_id: -1, // participant id from external platform (e.g. sona)
    event: -1, // event stamp from experiment
    } 
```

To add data just do : 
```
eyetracker.FrameDataLog.yourdata = 'somevalue or string'
```