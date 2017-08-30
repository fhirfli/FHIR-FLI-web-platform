function setGoals(type, number){

  var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/set-goals", true);
	//required for the post
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlhttp.send("type="+type+"&number="+number);
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			$.notify({
					icon: 'pe-7s-diskette',
					message: "Successfully Saved Goals!"

				},{
						type: 'success',
						timer: 4000
				});
      if(type == 'gym') setTimeout(refreshGymByMonth, 1000);
      else if(type == 'steps') setTimeout(refreshSteps24, 1000);
      setTimeout(getNotifications, 1000);
		}
	};
}

function setStepGoals(){
  var number = document.getElementById("stepsGoal").value;
  setGoals('steps', number);
}

function setGymGoals(){
  var number = document.getElementById("gymGoal").value;
  setGoals('gym', number);
}
