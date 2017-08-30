const STEPDIST = document.getElementById("stepDist");

function refreshStepDist(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(STEPDIST, data);

    }
  };
  xhttp.open("GET", "/graph/stepDist", true);
  xhttp.send();
}

refreshStepDist();
