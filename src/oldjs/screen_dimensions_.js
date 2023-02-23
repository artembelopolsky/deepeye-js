

// (function(window, document, undefined){
    // window.onload = init;
export function init(){
    devicePixelRatio = window.devicePixelRatio || 1;
    //devicePixelRatio = 1;
    dpi_x = Math.round(document.getElementById('testdiv').offsetWidth * devicePixelRatio);
    dpi_y = Math.round(document.getElementById('testdiv').offsetHeight * devicePixelRatio);
    computeDisplaySize();
}
// })(window, document, undefined);

var scale = 1/devicePixelRatio;
var fontSize = 20.0;
var devicePixelRatio;
var dpi_x;
var dpi_y;

var resWidth;
var resHeight;
var width_in_cm;
var width_in_inch;

// continuously check the monitor width and zoom level
setInterval(() => {
  let zoom_level_ok = check_zoom_level();
  computeDisplaySize();

  if(zoom_level_ok==false) {
    document.getElementById("proceed_button").disabled = false; // enable button to proceed
  }
  else {
    document.getElementById("proceed_button").disabled = true; // disable button
  }

}, 1000);

function resizeCC(mult) {
    scale *= mult;
    var card = document.getElementById('cc');
    card.style.width = card.offsetWidth * parseFloat(mult) + 'px';
    card.style.height = card.offsetHeight * parseFloat(mult) + 'px';
    fontSize *= mult;
    card.style.fontSize = fontSize + 'px';
    computeDisplaySize();
}

function computeDisplaySize(){
    // get the credit card element
    var card = document.getElementById('cc');

    // get the size of credit card in pixels
    var cardpx = card.clientWidth;

    // 96 is the DPI value for standard displays
    // devicePixelRatio - A value of 1 indicates a classic 96 DPI (76 DPI on some platforms) display, while a value of 2 is expected for HiDPI/Retina displays
    // scale by how much the size of credit card is increased/decreased.
    var cardcm = (cardpx / (devicePixelRatio * 96) / scale) * 2.54;
    width_in_cm = (cardcm / cardpx) * screen.width;
    width_in_inch = width_in_cm /  2.54;
    //update UI
    document.getElementById('width').innerHTML = width_in_cm.toFixed(2);
    document.getElementById('width_inch').innerHTML = width_in_inch.toFixed(2);
    resWidth = screen.width;
    resHeight = screen.height;
    document.getElementById('resWidth').innerHTML = resWidth;
    document.getElementById('resHeight').innerHTML = resHeight;
}

function check_zoom_level(){
    let zoom = ((window.outerWidth - 10)
        / window.innerWidth) * 100;

    if(zoom < 98 || zoom > 101) {
      document.getElementById('zoom_level_warning').innerHTML = 'Please adjust your zoom level to 100%';
      return true;
    }
    else {
      document.getElementById('zoom_level_warning').innerHTML = '';
      return false;
    }
}

function saveScreenDims(nextComponent = false){

    localStorage.setItem("resWidth",resWidth);
    localStorage.setItem("resHeight",resHeight);
    localStorage.setItem("width_cm",width_in_cm);
    localStorage.setItem("dpi_x", dpi_x);

    toggle_screendim()
    if (nextComponent){
      jatos.startNextComponent();
    }
}

function toggle_screendim(){
  if (document.getElementById("ScreenDimensions").style.display == "none"){
    document.getElementById("ScreenDimensions").style.display = "block";
    document.getElementById("WebcamPosition").style.display = "none";
  } else {
    document.getElementById("ScreenDimensions").style.display = "none";
    document.getElementById("WebcamPosition").style.display = "block";
  }
}