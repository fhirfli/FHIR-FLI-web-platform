function updateData(){
	var nickname   = document.forms['userdata']['nickname'].value;
	var email      = document.forms['userdata']['email'].value;
	var address    = document.forms['userdata']['address'].value;
	var city       = document.forms['userdata']['city'].value;
	var country    = document.forms['userdata']['country'].value;
	var postcode   = document.forms['userdata']['postcode'].value;
	var aboutMe    = document.forms['userdata']['aboutMe'].value;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/update-user-data", true);
	//required for the post
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlhttp.send("nickname="
  				+ nickname
  				+ "&email="
  				+ email
  				+ "&address="
  				+ address
  				+ "&city="
  				+ city
  				+ "&country="
  				+ country
  				+ "&postcode="
  				+ postcode
  				+ "&aboutMe="
  				+ aboutMe);
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
