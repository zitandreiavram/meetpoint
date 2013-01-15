var Tools = {
		
	capturePhoto: function() {
		navigator.camera.getPicture(Tools.capturePhotoSuccess, Tools.capturePhotoFail, { quality: 60 });
	},
	
	capturePhotoSuccess: function(link) {
		$('#profile_photo').attr('src', link);
		  upload_photo(imageData);
	},
	
	capturePhotoFail: function() {
		
	},
	
	getPhotoFromPhone: function() {
		var pictureSource = navigator.camera.PictureSourceType;
		var destinationType = navigator.camera.DestinationType
		var source = pictureSource.PHOTOLIBRARY; // pictureSource.SAVEDPHOTOALBUM
		
	    // Retrieve image file location from specified source
	    navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, { quality: 60, 
	      destinationType: destinationType.FILE_URI,
	      sourceType: source });
	}
	
}