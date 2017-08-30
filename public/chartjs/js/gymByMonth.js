const GYMBYMONTH = document.getElementById("gymByMonth");

function refreshGymByMonth(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(GYMBYMONTH, data);

    }
  };
  xhttp.open("GET", "/graph/gymByMonth", true);
  xhttp.send();
}

refreshGymByMonth();
