function getNotifications(){
  var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "/notifications", true);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
      var resText = this.responseText;
      notifications = JSON.parse(resText).notifications;
      document.getElementById("notificationNum").innerHTML = notifications.length;
      document.getElementById("notificationList").innerHTML = "";
      for (n in notifications){
        document.getElementById("notificationList").innerHTML += '<li><a href="#">' + notifications[n] + '</a></li>';
      }
    }
  };
}

getNotifications();
