export var html = `


<div class="container container-fluid px-0" id="result-ready-div" style="display: block;">
  <div class="justify-content-center">
          <div class="card o-hidden border-0 shadow-lg my-2 h-100">
              <div class="">
                  <img class="card-img img-responsive" style="width: 85%; height: 85%" id="result-image" src=""></img>
                  <div class="my-2"></div>
              </div>
              <div class="align-items-center d-flex justify-content-center p-0">
                <button id="recalibrate-button" class="btn btn-outline-primary ml-4" >Re-calibrate<i
                    class="bi bi-arrow-repeat m-1"></i></button>                                            
                <button id="accept-button" class="btn btn-outline-primary ml-4" disabled >Accept<i
                    class="bi bi-arrow-right m-1"></i></button>  
            </div>
              <div class="justify-content-center" id='text-message'></div>
          </div>

  </div>
</div>
`
