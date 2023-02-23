
export class FaceDetection {
  /**
   * Class that handles initializing webcam and starting face detection on the webcam feed during setup
   * This webcam setup is also used during eye-tracking
   * It is passed a parent object, which is the eyetracker object
   */

  constructor(parentObject=null, html){
    this.faceDetected=0;
    this.id_integrated_webcam = '';
    this.webcam_label;
    this.default_webcam = false;
    this.monitor_changed = false;    
    this.html = html;
    this.parentObject = parentObject;
    this.loopIsRunning = false;
    this.loop;
    this.devices;
    }

  start(){
    
    return new Promise((resolve, reject) => {

      console.log(`loopIsRunning at start: ${this.loopIsRunning}`);      

      // load and set up html if it doesn't exist
      if(document.getElementById("face-screen") == null) {
        var div = document.createElement('face-screen');
        div.setAttribute('id', 'face-screen');
        document.body.appendChild(div);
        div.innerHTML = this.html;
        this.video = document.getElementById("video");        
        this.canvas = document.getElementById("face_detection"); // canvas on which the face detection works

        this.getWebcamName() // get default webcam
        .then(async()=> {
          await faceapi.nets.tinyFaceDetector.loadFromUri('js/CalibrationProcedure/js/models'); // load model serially
          })
        .then(async()=> {            
          await faceapi.nets.faceLandmark68Net.loadFromUri('js/CalibrationProcedure/js/models'); // load model serially
          })
        .then(this.startVideoAndFaceDetection()) // start webcam followed by face detection
        .catch((err) => {
          console.error(err)
        });  
            
      }
      else {
        // set face detection html to visible if it already exists
        document.getElementById('face-screen').style.display = 'block';
        this.startFaceDetection(); // webcam is already started, restart face detection and overlay
      }   
            
      // when the 'Next' button is clicked
      document.getElementById("capture").addEventListener("click", ()=> {        
        //disable face detection loop when leaving head position screen
        if(this.loopIsRunning) {        
          clearInterval(this.loop);
          this.loopIsRunning = false;
        }
                
        // set face detection html invisible
        document.getElementById('face-screen').style.display = 'none';        

        // resolve the promise
        resolve(); 

        });
    })
     
  }

  async getWebcamName() {
    
    // make sure to use arrow functions inside the promises, otherwise
    // the context does not propagate for some reason...
    this.devices = await navigator.mediaDevices.enumerateDevices()
      .then((devices) => {        
        console.log(devices);
        devices.forEach((device) => {
          
          if(this.default_webcam == false && device.kind == 'videoinput') {
            this.default_webcam = device.label;
            this.webcam_label = this.default_webcam;
            console.log(`Default webcam is: ${this.default_webcam}`);
          }
        });
      });      
  }


  async startVideoAndFaceDetection() {  
    
    navigator.mediaDevices.getUserMedia({ video: {deviceId: this.default_webcam}}).then((stream) => {
          
      this.parentObject.video = document.getElementById("video");
      this.parentObject.video.srcObject = stream;
      this.parentObject.videoSettings = stream.getVideoTracks()[0].getSettings();
      
      console.log('default webcam in startVideo() : ',this.default_webcam);

      this.startFaceDetection();
      
    });    
 
}

  async startFaceDetection() {          
    
    const displaySize = { width: this.parentObject.videoSettings.width, height: this.parentObject.videoSettings.height};
    faceapi.matchDimensions(this.canvas, displaySize);

    
    if(this.loopIsRunning === false) {
      this.loopIsRunning = true;
      console.log(`loopIsRunning before setInterval: ${this.loopIsRunning}`);
    
      this.loop = setInterval(async () => {
          let detections;

          try {
            
            detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            this.faceDetected = detections[0].detection.score;
            //faceDetected = detections[0].score;
            // console.log(`FaceDetectionsYES: ${this.faceDetected}`);
            
            // get left and right eyebrows landmarks
            let left_eye_brow = detections[0].landmarks.getLeftEyeBrow();
            let right_eye_brow = detections[0].landmarks.getRightEyeBrow();
            
            // calculate the distance between the first and last eyebrow landmarks (used to infer frontal face position)
            let dist_rightEyeBrow = Math.sqrt(Math.pow(right_eye_brow[0]._x - right_eye_brow[4]._x, 2) + Math.pow(right_eye_brow[0]._y - right_eye_brow[4]._y, 2));
            let dist_leftEyeBrow = Math.sqrt(Math.pow(left_eye_brow[0]._x - left_eye_brow[4]._x, 2) + Math.pow(left_eye_brow[0]._y - left_eye_brow[4]._y, 2));
            
            // resize detections for plotting            
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            // clear the canvas from previous landmarks            
            this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
            // console.log(dist_leftEyeBrow,dist_rightEyeBrow)                      
               
            // enable proceed button if face is detected and the both eyebrows are equally long (front face position) and monitor is small
            if(this.faceDetected > 0.5 && (Math.abs(dist_rightEyeBrow - dist_leftEyeBrow) < 10) ) {
                              
                faceapi.draw.drawDetections(this.canvas, resizedDetections);
                // faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
                this.canvas.getContext("2d").lineWidth = 20;
                this.canvas.getContext("2d").strokeStyle="#008000"; // green outer box
                this.canvas.getContext("2d").strokeRect(0, 0, this.canvas.width, this.canvas.height)
                document.getElementById("capture").disabled = false; // enable button to proceed               
              
            }
            else {

                this.canvas.getContext("2d").lineWidth = 20;
                this.canvas.getContext("2d").strokeStyle="#FF0000"; // red outer box
                this.canvas.getContext("2d").strokeRect(0, 0, this.canvas.width, this.canvas.height)                
                document.getElementById("capture").disabled = true;
            }
    
            
    
          } catch (e) {
            // catch error when face not detected and delete previous face bounding box
            console.error(e);
            this.canvas.getContext("2d").lineWidth = 20;
            this.canvas.getContext("2d").strokeStyle="#FF0000"; // red outer box
            this.canvas.getContext("2d").strokeRect(0, 0, this.canvas.width, this.canvas.height)                
            document.getElementById("capture").disabled = true;         
          
          }
    
      }, 100); // update every 100 ms
    }
  }
}