var Tools = {
		
	capturePhoto: function() {
		navigator.camera.getPicture(Tools.capturePhotoSuccess, Tools.capturePhotoFail, { quality: 60 });
	},
	
	capturePhotoSuccess: function(link) {
		$('#profile_photo').attr('src', link).show();
		$('#profile_photo_field').val(link)();
		alert(link);
	},
	
	capturePhotoFail: function() {
		
	},
	
	getPhotoFromPhone: function() {
		alert('getPhotoFromPhone');
		
		var pictureSource = navigator.camera.PictureSourceType;
		alert(1);
		var destinationType = navigator.camera.DestinationType;
		alert(2);
		var source = pictureSource.PHOTOLIBRARY; // pictureSource.SAVEDPHOTOALBUM
		alert(3);
		
	    // Retrieve image file location from specified source
	    navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, { quality: 60, 
	      destinationType: destinationType.FILE_URI,
	      sourceType: source });
	    
	    alert(4);
	}
	
}