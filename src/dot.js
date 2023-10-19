
// Define dot class
export class Dot {
    constructor(x, y, diam1=18, diam2=50 , col=0, col_bulls_eye=255, total_dots=13, dotDuration=2300) {
      this.x = x;
      this.y = y;
      this.diam1 = diam1;
      this.diam2 = diam2;
      this.col = col;
      this.col_bulls_eye = col_bulls_eye;
      this.correct_resp = -1;
      this.key_pressed_already = false;
      this.key = false;
      this.visible=false;
      
      this.config = {
        total_trials: 1,
        dotDuration: dotDuration, // time dot is present
        dotAbsenceDuration: 0, // time dot is absent
        total_dots: total_dots, // total number of dots for calibration
        dot_diam_max: 50,
        dot_diam_min: 18,
        style: {
            fill: 200,
            background: 0,
            textStrokeWeight: 3,
            textStrokeColor: [255, 255, 255],
            color_bulls_eye: 0
        },
        delayWebcamCapture: 800 // time between dot presentation and start of frame capture
      }
      
      let smallStep = 0.1;
      let largeStep = 0.3;

      // ORIGINAL: start with 5 dots as a plus in the center
      // this.LOCATIONS = [
      //   //{x: window.screen.width/2, y: window.screen.height/2}, // center center is defined in p5setup.js        
      //   {x: 0 + this.config.dot_diam_max, y: window.screen.height/2}, // center left
      //   {x:  window.screen.width - this.config.dot_diam_max, y: window.screen.height/2}, // center right    
      //   {x: window.screen.width/2, y: 0 + this.config.dot_diam_max}, // top center  
      //   {x: window.screen.width/2, y: window.screen.height - this.config.dot_diam_max} // bottom center  
      // ];

      // AS % of screen: start with 5 dots as a plus in the center
      this.LOCATIONS = [
        //{x: window.screen.width/2, y: window.screen.height/2}, // center center is defined in p5setup.js        
        {x: 0 + window.screen.width*smallStep, y: window.screen.height/2}, // center left
        {x: window.screen.width - window.screen.width*smallStep, y: window.screen.height/2}, // center right    
        {x: window.screen.width/2, y: 0 + window.screen.height*smallStep}, // top center  
        {x: window.screen.width/2, y: window.screen.height - window.screen.height*smallStep} // bottom center  
      ];

      // ORIGINAL: add 4 more dots till 9
      // if (this.config.total_dots == 9) {
      //   this.LOCATIONS.push(      
      //     {x: 0 + this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top left          
      //     {x:  window.screen.width - this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top right          
      //     {x: 0 + this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max}, // bottom left          
      //     {x:  window.screen.width - this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max} // bottom right
      //   );
      // }

      // AS % of screen: add 4 more dots till 9      
      if (this.config.total_dots == 9) {
        this.LOCATIONS.push(      
          {x: 0 + window.screen.width*smallStep, y: 0 + window.screen.height*smallStep}, // top left          
          {x: window.screen.width - window.screen.width*smallStep, y: 0 + window.screen.height*smallStep}, // top right          
          {x: 0 + window.screen.width*smallStep, y: window.screen.height - window.screen.height*smallStep}, // bottom left          
          {x: window.screen.width - window.screen.width*smallStep, y: window.screen.height - window.screen.height*smallStep} // bottom right
        );
      }      

      // // ORIGINAL: add 8 more dots till 13
      // else if (this.config.total_dots == 13) {
      //   this.LOCATIONS.push(

      //     // add 4 more dots till 9
      //     {x: 0 + this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top left          
      //     {x:  window.screen.width - this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top right          
      //     {x: 0 + this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max}, // bottom left          
      //     {x:  window.screen.width - this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max}, // bottom right
         
      //     // add 4 more dots till 13
      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: window.screen.height/4 + this.config.dot_diam_max}, // top left of extra 4 dots
      //     {x:  window.screen.width - window.screen.width/4  - this.config.dot_diam_max, y: window.screen.height/4 + this.config.dot_diam_max}, // top right of extra 4 dots
      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // bottom left of extra 4 dots
      //     {x:  window.screen.width - window.screen.width/4  - this.config.dot_diam_max, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // bottom right of extra 4 dots
      //   );
      // }

      // AS % of screen: add 8 more dots till 13
      else if (this.config.total_dots == 13) {
        this.LOCATIONS.push(

          // add 4 more dots till 9
          {x: 0 + window.screen.width*smallStep, y: 0 + window.screen.height*smallStep}, // top left          
          {x: window.screen.width - window.screen.width*smallStep, y: 0 + window.screen.height*smallStep}, // top right          
          {x: 0 + window.screen.width*smallStep, y: window.screen.height - window.screen.height*smallStep}, // bottom left          
          {x: window.screen.width - window.screen.width*smallStep, y: window.screen.height - window.screen.height*smallStep}, // bottom right
         
          // add 4 more dots till 13
          {x:  0 + window.screen.width*largeStep, y: 0 + window.screen.height*largeStep}, // top left of extra 4 dots
          {x: window.screen.width - window.screen.width*largeStep, y: 0 + window.screen.height*largeStep}, // top right of extra 4 dots
          {x: 0 + window.screen.width*largeStep, y: window.screen.height - window.screen.height*largeStep}, // bottom left of extra 4 dots
          {x: window.screen.width - window.screen.width*largeStep, y: window.screen.height - window.screen.height*largeStep}, // bottom right of extra 4 dots
        );
      }     

      // ORIGINAL: add 20 more dots
      // else if (this.config.total_dots == 25) {
      //   this.LOCATIONS.push(

      //      // add 4 more dots till 9
      //      {x: 0 + this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top left          
      //      {x:  window.screen.width - this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top right          
      //      {x: 0 + this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max}, // bottom left          
      //      {x:  window.screen.width - this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max}, // bottom right            
          
      //     // add 4 more dots till 13
      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: window.screen.height/4 + this.config.dot_diam_max}, // top left of extra 4 dots
      //     {x:  window.screen.width - window.screen.width/4  - this.config.dot_diam_max, y: window.screen.height/4 + this.config.dot_diam_max}, // top right of extra 4 dots
      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // bottom left of extra 4 dots
      //     {x:  window.screen.width - window.screen.width/4  - this.config.dot_diam_max, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // bottom right of extra 4 dots

      //     // add 12 more dots till 25
      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top row, second from the left 
      //     {x:  window.screen.width - window.screen.width/4 - this.config.dot_diam_max, y: 0 + this.config.dot_diam_max}, // top row, second from the right

      //     {x:  0 + this.config.dot_diam_max, y: window.screen.height/4 + this.config.dot_diam_max}, // second row from top, left 
      //     {x: window.screen.width/2, y: window.screen.height/4 + this.config.dot_diam_max}, // second row from top, center 
      //     {x:  window.screen.width - this.config.dot_diam_max, y: window.screen.height/4 + this.config.dot_diam_max}, // second row from top, right

      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: window.screen.height/2}, // center row, second from the left 
      //     {x:  window.screen.width - window.screen.width/4 - this.config.dot_diam_max, y: window.screen.height/2}, // center row, second from the right

      //     {x:  0 + this.config.dot_diam_max, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // fourth row from top, left 
      //     {x: window.screen.width/2, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // fourth row from top, center 
      //     {x:  window.screen.width - this.config.dot_diam_max, y: window.screen.height - window.screen.height/4 - this.config.dot_diam_max}, // fourth row from top, right

      //     {x:  window.screen.width/4 + this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max}, // bottom row, second from the left 
      //     {x:  window.screen.width - window.screen.width/4 - this.config.dot_diam_max, y: window.screen.height - this.config.dot_diam_max} // bottom row, second from the right
          
      //   );
      // }

      // AS % of screen: add 20 more dots
      else if (this.config.total_dots == 25) {
        this.LOCATIONS.push(

           
          // add 4 more dots till 9
          {x: 0 + window.screen.width*smallStep, y: 0 + window.screen.height*smallStep}, // top left          
          {x: window.screen.width - window.screen.width*smallStep, y: 0 + window.screen.height*smallStep}, // top right          
          {x: 0 + window.screen.width*smallStep, y: window.screen.height - window.screen.height*smallStep}, // bottom left          
          {x: window.screen.width - window.screen.width*smallStep, y: window.screen.height - window.screen.height*smallStep}, // bottom right
         
          // add 4 more dots till 13
          {x: 0 + window.screen.width*largeStep, y: 0 + window.screen.height*largeStep}, // top left of extra 4 dots
          {x: window.screen.width - window.screen.width*largeStep, y: 0 + window.screen.height*largeStep}, // top right of extra 4 dots
          {x: 0 + window.screen.width*largeStep, y: window.screen.height - window.screen.height*largeStep}, // bottom left of extra 4 dots
          {x: window.screen.width - window.screen.width*largeStep, y: window.screen.height - window.screen.height*largeStep}, // bottom right of extra 4 dots

          // add 12 more dots till 25
          {x: 0 + window.screen.width*largeStep, y: 0 + window.screen.height*smallStep}, // top row, second from the left 
          {x: window.screen.width - window.screen.width*largeStep, y: 0 + window.screen.height*smallStep}, // top row, second from the right

          {x: 0 + window.screen.width*smallStep, y: 0 + window.screen.height*largeStep}, // second row from top, left 
          {x: window.screen.width/2, y: 0 + window.screen.height*largeStep}, // second row from top, center 
          {x: window.screen.width - window.screen.width*smallStep, y: 0 + window.screen.height*largeStep}, // second row from top, right

          {x: 0 + window.screen.width*largeStep, y: window.screen.height/2}, // center row, second from the left 
          {x: window.screen.width - window.screen.width*largeStep, y: window.screen.height/2}, // center row, second from the right

          {x: 0 + window.screen.width*smallStep, y: window.screen.height - window.screen.height*largeStep}, // fourth row from top, left 
          {x: window.screen.width/2, y: window.screen.height - window.screen.height*largeStep}, // fourth row from top, center 
          {x: window.screen.width - window.screen.width*smallStep, y: window.screen.height - window.screen.height*largeStep}, // fourth row from top, right

          {x:  0 + window.screen.width*largeStep, y: window.screen.height - window.screen.height*smallStep}, // bottom row, second from the left 
          {x:  window.screen.width - window.screen.width*largeStep, y: window.screen.height - window.screen.height*smallStep} // bottom row, second from the right
          
        );
      }

      else if(this.config.total_dots != 5 && this.config.total_dots != 9 && this.config.total_dots != 13 && this.config.total_dots != 25) {
          throw new Error('Wrong number of calibration dots: use only 5, 9, 13 or 25');
      }
    }
  
    show(type='none') {
  
      noStroke();
      fill(this.col);
      circle(this.x, this.y, this.diam1);
  
      if(type=='circle') {
        fill(this.col_bulls_eye);
        circle(this.x, this.y, this.diam1/4);
      }
      else if(type=='left_arrow') {
  
        fill(this.col_bulls_eye);
        textSize(25);
        textStyle(BOLD);
        text("←", this.x-11, this.y+7);
      }
      else if(type=='right_arrow') {
  
        fill(this.col_bulls_eye);
        textSize(25);
        textStyle(BOLD);
        text("→", this.x-11, this.y+7);
      }
  
  
    }
  
    pulsate() {
      if (this.diam1 < this.diam2){
        this.diam1 = this.diam1 + 1;
      }
      else if (this.diam1 == this.diam2){
        this.diam1 = this.config.dot_diam_min;
      }
    }
  
    move(x, y) {
  
      //this.correct_resp = reset_corr_resp;
      this.x = x;
      this.y = y;
    }
  
    clicked() {
      var d = dist(mouseX, mouseY, this.x, this.y);
      //fullscreen(true); // set fullscreen if it happenned not to be fullscreen
      console.log('d in clicked : ',d)
      console.log(this.diam2/2)

      if(d < this.diam2/2){
        this.col_bulls_eye = color(50, 200, 0);
        this.correct_resp = 1;
      }
    }
}