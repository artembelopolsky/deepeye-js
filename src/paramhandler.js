export class ParamHandler{
    /**
     * Helper class for eyetracker that handles getting parameters from client
     * It is passed a parent object, which is the eyetracker object
     */

    constructor(parentObject=null, html){
        this.html = html;

        //// INITIALIE ALL PARAMETERS :
        // Screen dimensions : 
        this.resWidth;
        this.resHeight;
        this.width_cm;
        this.width_in_inch;
        this.dpi_x;

        this.scale = 1/devicePixelRatio;
        this.fontSize = 20.0;
        this.devicePixelRatio;
        this.dpi_x;
        this.dpi_y;
        // Webcam position : 
        this.verticalDist;

        this.session_timestamp = new Date().toISOString().replace(/[T:-]/g, '_').replace(/\..+/, ''); //format timestamp, use as participant_id
    }

    setHTML(){
      
        // hide present body element
        var initial_content = document.getElementsByTagName('body')[0];
        for (const child of initial_content.children) child.style.display = 'none';

        // // insert html : 
        // initial_content.innerHTML += this.html;

        // new way
        var div = document.createElement('setup-screen');
        document.body.appendChild(div);
        div.innerHTML = this.html;

        // // add button
        // var x = document.createElement("BUTTON");
        // var t = document.createTextNode("Click me");
        // x.appendChild(t);
        // document.body.appendChild(x);
        // x.addEventListener("click", ()=> {
        //     //document.getElementById('result-ready-div').remove();
        //     done();});

        
        
        // compute first guess of screen width and height
        this.initial_estimate()

        // enable loop for checking zoom level and monitor width :
        this.checkloop()
    }

    initial_estimate(){
        this.devicePixelRatio = window.devicePixelRatio || 1;
        //devicePixelRatio = 1;
        this.dpi_x = Math.round(document.getElementById('testdiv').offsetWidth * devicePixelRatio);
        this.dpi_y = Math.round(document.getElementById('testdiv').offsetHeight * devicePixelRatio);
        this.computeDisplaySize();
    }

    checkloop (){
        this.loop = setInterval(() => {
            let zoom_level_ok = this.check_zoom_level();
            this.computeDisplaySize();
        
            if(zoom_level_ok==false) {
            document.getElementById("proceed_button").disabled = false; // enable button to proceed
            }
            else {
            document.getElementById("proceed_button").disabled = true; // disable button
            }
        
        }, 1000)
    }

    computeDisplaySize(){
        // get the credit card element
        var card = document.getElementById('cc');
    
        // get the size of credit card in pixels
        var cardpx = card.clientWidth;
    
        // 96 is the DPI value for standard displays
        // devicePixelRatio - A value of 1 indicates a classic 96 DPI (76 DPI on some platforms) display, while a value of 2 is expected for HiDPI/Retina displays
        // scale by how much the size of credit card is increased/decreased.
        var cardcm = (cardpx / (devicePixelRatio * 96) / this.scale) * 2.54;
        this.width_cm = (cardcm / cardpx) * screen.width;
        this.width_in_inch = this.width_cm /  2.54;
        //update UI
        document.getElementById('width').innerHTML = this.width_cm.toFixed(2);
        document.getElementById('width_inch').innerHTML = this.width_in_inch.toFixed(2);
        this.resWidth = screen.width;
        this.resHeight = screen.height;
        document.getElementById('resWidth').innerHTML = this.resWidth;
        document.getElementById('resHeight').innerHTML = this.resHeight;
    }
    
    check_zoom_level(){
        let zoom = ((window.outerWidth - 10) / window.innerWidth) * 100;
    
        if(zoom < 98 || zoom > 101) {
          document.getElementById('zoom_level_warning').innerHTML = 'Please adjust your zoom level to 100%';
          return true;
        }
        else {
          document.getElementById('zoom_level_warning').innerHTML = '';
          return false;
        }
    }

    resizeCC(mult) {
        this.scale *= mult;
        var card = document.getElementById('cc');
        card.style.width = card.offsetWidth * parseFloat(mult) + 'px';
        card.style.height = card.offsetHeight * parseFloat(mult) + 'px';
        this.fontSize *= mult;
        card.style.fontSize = this.fontSize + 'px';
        this.computeDisplaySize();
    }

    toggle_screendim(){
        if (document.getElementById("ScreenDimensions").style.display == "none"){
          document.getElementById("ScreenDimensions").style.display = "block";
          document.getElementById("WebcamPosition").style.display = "none";
        } else {
          document.getElementById("ScreenDimensions").style.display = "none";
          document.getElementById("WebcamPosition").style.display = "block";
        }
    }

    saveScreenDims(nextComponent = false){        

        eyetracker.system_info.screen_resolution = [Math.floor(this.resWidth), Math.floor(this.resHeight)];
        eyetracker.system_info.scrW_cm = parseFloat(this.width_cm);
        eyetracker.system_info.dpi_x = this.dpi_x;

        // set the default vertical distance if webcam setup html is dropped in the future
        eyetracker.system_info.top_left_tocam_cm = [-eyetracker.system_info.scrW_cm/2, -(1.0)];
    
        this.toggle_screendim();
    }

    saveVerticalDist(){

      /* Get the documentElement (<html>) to display the page in fullscreen */
      let wholeDocumentElement = document.documentElement;
      
      this.openFullscreen(wholeDocumentElement);

      this.verticalDist = document.getElementById('verticalDist').value;        
      eyetracker.system_info.top_left_tocam_cm = [-eyetracker.system_info.scrW_cm/2, -(parseFloat(this.verticalDist))];

      // clear html : 
      document.getElementById('ScreenDimensions').remove();
      document.getElementById('WebcamPosition').remove();  
      
      //disable loops  
      clearInterval(eyetracker.paramHandler.loop);       

      // resets jsPsych element (needed for proper return to jsPsych)
      document.getElementsByClassName("jspsych-content-wrapper")[0].style.display = "flex";
      
      // returns control to jsPsych         
      eyetracker.return_jsPsych();
      
    
    }

    imposeMinMax(el){
        if(el.value != ""){
          if(parseInt(el.value) < parseInt(el.min)){
            el.value = el.min;
          }
          if(parseInt(el.value) > parseInt(el.max)){
            el.value = el.max;
          }
        }
      }

    openFullscreen(elem) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
          elem.msRequestFullscreen();
        }
      }

}