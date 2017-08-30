const GYMDIST = document.getElementById("gymDist");

function refreshGymDist(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(GYMDIST, data);

    }
  };
  xhttp.open("GET", "/graph/gymDist", true);
  xhttp.send();
}

refreshGymDist();
