const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Oct", "Nov", "Dec"]
function getBookings(){
  var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "/bookings", true);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
      bookings = JSON.parse(this.responseText);
      var obj = document.getElementById("classBookings");
      if(bookings.length > 0) document.getElementById("classCategory").innerHTML = "";
      obj.innerHTML = "";
      for (b in bookings){
        obj.innerHTML +=
        '<div class="col-md-6">' +
          '<div class="thumbnail">' +
              '<img src="/img/' + bookings[b].name.charAt(0).toUpperCase() + bookings[b].name.toLowerCase().slice(1) + '.jpg" style="width:100%">' +
              '<div class="caption">' +
                '<h3>' +
                '</h3>'+
                '<p>' +
                  (new Date(bookings[b].date)).getDate() + "/" + months[(new Date(bookings[b].date)).getMonth()] + "/" + (new Date(bookings[b].date)).getYear() + " at " + bookings[b].time +
                '</p>' +
              '</div>' +
          '</div>' +
        '</div>'
        ;
      }
    }
  };
}

getBookings();
