export var html = `
<div class="vh-100" id="experiment-div">
<div class="">
    <div class="container">
        <h3 class="content-head is-left" id="google_translate_element">
          <script type="text/javascript">
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
          }
          </script>
          <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
        </h3>
        <h3 class="content-head is-left" id="external_monitor_warning" style="color:red">
        </h3>
        <hr> </hr>
        <h3>Head position </h3>
        <p class="lead">Sit comfortably facing the camera. Make sure your face and eyes are clearly visible. You can continue as soon as your face is detected.</p>
        <hr class="my-4">
    </div>
</div>


<div id="container" class="text-center">
    <div class="container_row text-center">
        <video class="layer2" id="video" autoplay style="height: 5in; background-color: #FFFFFF; color: white; border-radius: 25px;"></video>
        <canvas class="layer1" id="face_detection" style="height:5in"></canvas>

        <!-- <image class="layer1" id="image_overlay" src="img/face_outline.png" style="height: 5in; border-radius: 25px;"></image> -->
    </div>
    <div style="position: relative;">
        <br>
        <div class="btn-group" style="margin-top: 5in;" role="group" aria-label="Basic example">           
            <button id="capture" class="btn btn-outline-primary" disabled>Continue<i class="bi bi-play m-1"></i></button>            
        </div>
        <div id="errorMsg"></div>
    </div>
</div>
</div>
`
