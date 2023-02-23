export var html = `

<div id="ScreenDimensions">
    <div class="">
        <div class="container">
        <h3 class="content-head is-left" id="google_translate_element">
            <script type="text/javascript">
            function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
            }
            import {eyetracker} from "./eyetracker.js"
            </script>
            <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
        </h3>

        <h3 class="content-head is-left" id="external_monitor_warning" style="color:red">
        </h3>
        <h3 class="content-head is-left" id="zoom_level_warning" style="color:red">
        </h3>

            <hr> </hr>
            <h3>Screen Dimensions</h3>
            <p class="lead">Verify your screen width here</p>
            <hr class="my-4">
            <p>To verify the screen width, place a physical standard size card (credit card, library card, etc.)
                against the image of the card below and increase or decrease its size until it matches the size of the
                physical card (width = 8.5 cm / 3.35 inch)</p>
        </div>
    </div>
    <hr>
    <div id="testdiv" style="height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;"></div>

    <div class="container-fluid">
        <div class="row">
            <div class="col-md-7 float-right">
                <!-- <div id="cc" style="width: 373.8px; height: 236.25px;text-align: center; font-size: 23.1525px; background-color:#000000;border-radius: 25px;margin: 10px auto;color: white;"> -->
                <div class="float-right">
                    <div id="cc"
                    style="width: 3.375in; height: 2.125in; text-align: center; font-size: 23.1525px; background-color: #000000; border-radius: 25px; margin: 10px auto; color: white;">
                    <div style="height: 70%;">
                        <br>STANDARD SIZE CARD
                    </div>
                    <div style="float: bottom;">1234&nbsp;&nbsp;5678&nbsp;&nbsp;9012&nbsp;&nbsp;3456
                    </div>
                </div>


                <div class="text-center">
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-danger btn-lg" onclick="eyetracker.paramHandler.resizeCC(1/1.05);">Decrease
                            size</button>
                        <button type="button" class="btn btn-success btn-lg" onclick="eyetracker.paramHandler.resizeCC(1.05);">Increase
                            Size</button>
                    </div>
                </div>
                </div>
            </div>
            <div class="col-md-5 mt-3">


                <div class="row m-3">
                    <h5 class="text-muted mr-3">Screen Width: </h5>
                    <!-- <label class="strong  h5" id="width">0.0</label> X <label class="strong  h5" id="height">0.0</label> -->
                    <label class="strong  h5" id="width">0.0</label>
                    <h5 class="text-muted ml-1">cm</h5>
                    &nbsp;(
                    <label class="strong  h5" id="width_inch"> 0.0</label>
                    <h5 class="text-muted ml-1">inch</h5> &nbsp;)
                </div>

                <div class="row m-3">
                    <h5 class="text-muted mr-3">Screen Resolution: </h5>
                    <label class="strong h5" id="resWidth">0.0</label> X <label class="strong  h5"
                        id="resHeight">0.0</label>
                </div>

            </div>
        </div>
    </div>
    <hr>
    <div class="text-center">
        <div class="btn-group" role="group" aria-label="Basic example">
            <!-- <a type="button" class="btn btn-outline-primary" href="../index.html"><i
                    class="bi bi-arrow-left m-1"></i>Previous</a> -->
            <button id="proceed_button" type="button" class="btn btn-outline-primary" disabled onclick="eyetracker.paramHandler.saveScreenDims()">Next<i
                    class="bi bi-arrow-right m-1"></i></button>
            <!-- <button id="proceed_button" class="btn btn-outline-primary" disabled onclick="checkFace()">Nextt<i class="bi bi-play m-1"></i></button> -->
        </div>
    </div>
</div>

<div id="WebcamPosition" style="display: none;">
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

            <hr> </hr>
            <h3>Webcam position</h3>
            <p class="lead">Use only laptops with a built-in camera positioned above the screen, in the
                center. Disconnect any external webcams. Verify the vertical distance between webcam and the screen here,
                should be between (0.1-3.0 cm). </p>
            <hr class="my-4">
        </div>
    </div>
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-7 text-right">
                <img src="img/camera.jpg" class="rounded img-fluid w-50 p-3" alt="...">
            </div>
            <div class="col-md-5 mt-5">
                <div class="form-row mt-5">
                    <div class="col-4 mr-0">
                        <h5 class="text-muted"><small>
                                <h5 class="text-muted ml-0">Vertical Distance (cm):</h5>(from webcam to screen)
                            </small></h5>
                    </div>
                    <div class="col">
                        <input class="col-md-6" type="number" id="verticalDist" class="form-control form-control-user" min=0.0 step=0.1
                            placeholder="1.0 cm" onkeyup=eyetracker.paramHandler.imposeMinMax(this)>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <hr>
    <div class="text-center">
        <div class="btn-group" role="group" aria-label="Basic example">
            <a type="button" class="btn btn-outline-primary" onclick = "eyetracker.paramHandler.toggle_screendim()"><i
                    class="bi bi-arrow-left m-1"></i>Previous</a>
            <a type="button" id="next-button" class="btn btn-outline-primary" onclick="eyetracker.paramHandler.saveVerticalDist()">Next<i
                    class="bi bi-arrow-right m-1"></i></a>
        </div>
    </div>
</div>
`

