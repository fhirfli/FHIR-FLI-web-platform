function updateData(){
	var nuffield   = document.forms['data']['nuffield'].value;
	var openMRS    = document.getElementById('openMRS').checked;
	var msHealth   = document.getElementById('msHealth').checked;
	var startDate  = document.forms['data']['startDate'].value;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/update-data", true);
	//required for the post
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlhttp.send(
			"nuffield="+nuffield+
			"&openMRS="+openMRS+
			"&msHealth="+msHealth+
			"&startDate="+startDate
		);
	xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				$.notify({
						icon: 'pe-7s-diskette',
						message: "Successfully Saved"

					},{
							type: 'success',
							timer: 4000
					});
			}
		};
}
