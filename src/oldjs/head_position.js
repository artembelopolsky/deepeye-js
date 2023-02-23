
const session_timestamp = new Date().toISOString().replace(/[T:-]/g, '_').replace(/\..+/, ''); //format timestamp, use as participant_id
localStorage.setItem("session_timestamp", session_timestamp); // store in memory

const MODEL_URL = 'js/models'
const video = document.getElementById("video");
const canvas = document.getElementById("face_detection");
let faceDetected=0;
let id_integrated_webcam = '';
let webcam_label;
let default_webcam = false;
let monitor_changed;

// Different way to load models
// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//   //faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
//   faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
// ]).then(startVideo);

// to select specific webcam, need to find id of integrated webcam using enumerateDevices()
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// need to get permissions to use the webcam before devices can be enumerated
// permissions are obtained using getUserMedia
// https://stackoverflow.com/questions/60297972/navigator-mediadevices-enumeratedevices-returns-empty-labels
// https://www.html5rocks.com/en/tutorials/getusermedia/intro/
(async () => {
  await navigator.mediaDevices.getUserMedia({video: true}); // wait until permission is granted
  let devices = await navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
    devices.forEach(function(device) {
      if(default_webcam == false && device.kind == 'videoinput') {
        default_webcam = device.label;
        webcam_label = default_webcam;
        console.log(`Default webcam is: ${default_webcam}`);
      }
      console.log(device.kind + ": " + device.label +
                  " id = " + device.deviceId);
      if(device.label.toLowerCase().includes('integrated') || device.label.toLowerCase().includes('built-in')) {
                  id_integrated_webcam = device.deviceId;
                  webcam_label = device.label;
                  console.log(`built-in webcam is: ${webcam_label}:${id_integrated_webcam}`);
      }
    });
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  }).then([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // load models

    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]).then(startVideo); // start video after everything is loaded

})();

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log("enumerateDevices() not supported.");
}


// try to start the integrated webcam, switch to other if failed
// use  deviceId: id_integrated_webcam to start internal webcam,
// use deviceId: default_webcam for the first detected webcam
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {deviceId: default_webcam}}).then((stream) => {
  video.srcObject = stream;
});
}

// video.style.transform = "scale(-1,1)"; // flips the video horizontally (mirrors)
// canvas.style.transform = "scale(-1,1)"; // flips the canvas (face detections) horizontally (mirrors)


video.addEventListener("playing", () => {
  const displaySize = { width: video.videoWidth, height: video.videoHeight};
  // console.log(displaySize);
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {

      // const detections = await faceapi.detectAllFaces(video).withFaceLandmarks();
      let detections;

      try {
        //detections = await faceapi.detectAllFaces(video).withFaceLandmarks();
        detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        faceDetected = detections[0].detection.score;
        //faceDetected = detections[0].score;
        console.log(`Detections: ${faceDetected}`);
        // get left and right eyebrows landmarks
        let left_eye_brow = detections[0].landmarks.getLeftEyeBrow();
        let right_eye_brow = detections[0].landmarks.getRightEyeBrow();
        // calculate the distance between the first and last eyebrow landmarks (used to infer frontal face position)
        let dist_rightEyeBrow = Math.sqrt(Math.pow(right_eye_brow[0]._x - right_eye_brow[4]._x, 2) + Math.pow(right_eye_brow[0]._y - right_eye_brow[4]._y, 2));
        let dist_leftEyeBrow = Math.sqrt(Math.pow(left_eye_brow[0]._x - left_eye_brow[4]._x, 2) + Math.pow(left_eye_brow[0]._y - left_eye_brow[4]._y, 2));
        // resize detections for plotting
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // clear the canvas from previous landmarks
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        // enable proceed button if face is detected and the both eyebrows are equally long (front face position) and monitor is small
        if(faceDetected > 0.7 && (Math.abs(dist_rightEyeBrow - dist_leftEyeBrow) < 10) && monitor_changed==false) {
          // if(Math.abs(dist_rightEyeBrow - dist_leftEyeBrow) < 10) {
            faceapi.draw.drawDetections(canvas, resizedDetections);
            // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            document.getElementById("capture").disabled = false; // enable button to proceed
            document.getElementById('face_found_message').style.color = "green";
            document.getElementById('face_found_message').innerHTML = 'Face Detected';
          // }
        }
        else {
          document.getElementById("capture").disabled = true;
          document.getElementById('face_found_message').style.color = "red";
          document.getElementById('face_found_message').innerHTML = 'Face Not Detected';
        }

        check_monitor_change(); // prevents running if monitor changed

      } catch (e) {
        // catch error when face not detected and delete previous bounding box
        console.error('face not detected');
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById("capture").disabled = true;
      }

  }, 100) // update every 100 ms

});

// check if monitor resolution changed from when set in screen_dimensions
function check_monitor_change() {

  if(screen.width != localStorage.getItem("resWidth") ) {
    document.getElementById('external_monitor_warning').innerHTML = 'You seem to have changed monitors. Please move the window to the laptop monitor.';
    monitor_changed = true;
  }
  else {
    document.getElementById('external_monitor_warning').innerHTML = '';
    monitor_changed = false;
  }
}

function checkFace() {
      localStorage.setItem("id_webcam", default_webcam); // save the id of the integrated webcam for the calibration game
      localStorage.setItem("label_webcam", webcam_label); // save label for webcam
      jatos.startNextComponent();
}
