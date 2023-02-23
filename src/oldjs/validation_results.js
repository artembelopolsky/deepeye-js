
window.onload = init;
function init(){
    updateResult("img/2022_08_29_20_00_17.jpg");
    toggleElement("result-ready-div");
    
}

function toggleElement(elementId) {
    var x = document.getElementById(elementId);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function updateResult(response) {
    const image = document.getElementById("result-image");
    image.src = response;
       
}
