const STEPS24 = document.getElementById("steps24");

function refreshSteps24(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let steps24 = new Chart(STEPS24, data);

    }
  };
  xhttp.open("GET", "/graph/steps24", true);
  xhttp.send();
}

refreshSteps24();
