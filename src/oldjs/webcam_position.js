function saveScreenDims(){

    localStorage.setItem("verticalDist", document.getElementById('verticalDist').value);
    jatos.startNextComponent(document.getElementById('verticalDist').value); // jatos function to go to next component

}

// checks if the user entered vertical distance that is out of range
function imposeMinMax(el){
  if(el.value != ""){
    if(parseInt(el.value) < parseInt(el.min)){
      el.value = el.min;
    }
    if(parseInt(el.value) > parseInt(el.max)){
      el.value = el.max;
    }
  }
}
