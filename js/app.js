
// Wait for PhoneGap to connect with the device
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
//	Map.init();
	Lang.init();
}


var watchID;

jQuery(document).ready(function($) {
	
	Lang.init();
	
	if (User.isLogged()) {
		$('#index').hide();
		$('#wrap').show();
		Map.init();
		$('#loading').hide();
		$('#button_login, #button_register').removeClass('hidden');
		$('#footer').show();
	}
	else {
		User.getCountries();
	}
	
	
//	alert(screen.width + ' ' + screen.height);
	
	$('#home').bind('click', function() {
		$('#index').show();
		$('#wrap, #login, #register').hide();
		return false;
	})
	
	$('#button_login').bind('click', function() {
		$('#index').hide();
		$('#wrap, #login').show();
		return false;
	})
	
	$('#button_register').bind('click', function() {
		$('#index').hide();
		$('#wrap, #register').show();
		return false;
	})
	
	$('#submit_register').bind('click', function() {
		User.register($('#form_register').serialize())
	})
	
	$('#submit_login').bind('click', function() {
		if ($.trim($('#form_login_email').val()) == '' || $.trim($('#form_login_password').val()) == '') {
			return false;
		}
		
		User.login($('#form_login').serialize())
	})
	
	$('#form_register_sex').iphoneStyle({
		checkedLabel: 'F',
		uncheckedLabel: 'M'
	});
	
	
	return false;
	
	if (is_logged()) {
		$('.main').hide();
		$('.map').show();
		map();
		$('.logout').show();
		populate();
	}
	
	$('.nav').bind('click', function() {
		var id = $(this).attr('id');
		$('.info').hide();
		$('.' + id).show();
		return false;
	})
	
	$('#register_action').bind('click', function() {
		$.post(url, $('#register_form').serialize(), function(data) {
			message(data.message);
		}, 'JSON')
	})
	
	$('#login_action2').bind('click', function() {
		navigator.geolocation.getCurrentPosition(function(p) {
			$('#login_lat').val(p.coords.latitude);
			$('#login_long').val(p.coords.longitude);
			
			$.post(url, $('#login_form').serialize(), function(data) {
				if (data.result == 1) {
					$('.main, .message').hide();
					$('.map').show();
					var data = { 'logged_in': 1, 'user' : data.user};
					localStorage.setItem('_app_data', JSON.stringify(data));
					listen();
					map();
					populate();
					$('.logout').show();
				}
				else {
					message(data.message);
				}
			}, 'JSON')
			
		}, function(){})
	})
	
	$('#logout').bind('click', function() {
		$.getJSON(url, {action: 'logout', user: get_user().user}, function() {
			$('.logout').hide();
			$('.main').show();
			$('.map').hide();
			$('#send_message').hide();
			navigator.geolocation.clearWatch(watchID);
			localStorage.removeItem('_app_data');
		})
	})
	
	$('#show_the_map').bind('click', function() {
		$('#send_message').hide();
		$('.main').hide();
		$('.map').show();
		return false;
	})
	
	$('#show_main').bind('click', function() {
		$('#send_message').hide();
		$('.map').hide();
		$('.main').show();
		return false;
	})
	
	$('#notification').bind('click', function() {
		navigator.notification.confirm('Message!', confirmCallback, 'Chat?', 'YES,NO');
		return false;
	})
	
	function confirmCallback(buttonIndex) {
		alert('You selected button ' + buttonIndex);
	}
	
	var get_messages_timer;
	
	$('.send_message_open').live('click', function() {
		var username = $(this).attr('rev');
		var to = $(this).attr('rel');
		$('#to').val(to);
		var from = get_user().user;
		$('#from').val(from);
		$('#to_name').text(username);
		$('#send_message').show();
		
		get_messages_timer = window.setInterval(function() {
			$.getJSON(url, {action: 'chat', from: from, to: to}, function(data) {
				$('#chat').html('');
				put_chat(data.messages);
			})
		}, 1000);
		
		return false;
	})
	
	$('#send_message_action').bind('click', function() {
		$.post(url, $('#send_message_form').serialize(), function(data) {
			if (data.result = 1) {
				$('#chat').html('');
				put_chat(data.messages);
				$('#message_content').val('')
			}
		}, 'JSON')
	})

})

function put_chat(messages) {
	$(messages).each(function() {
		var message = this.message + '<hr />';
		$('#chat').append(message);
	})
}

var markers = [];

function populate() {
	var user = get_user();
	
	var x = window.setInterval(function() {
		$.getJSON(url, {action: 'get_points', user: user.user}, function(data) {
			$(data.points).each(function() {
				
				var index = this.id;
				
//				for (var i = 0; i < markers.length; i++ ) {
//					if (markers[i].user == this.id) {
//						index = i;
//					}
//				}
				
				// if user no longer online, remove point
				if (this.online == 0) {
					if (typeof markers[index] != 'undefined') {
						markers[index].setMap(null);
						markers.splice(index, 1);
					}
				}
				
				// if user still online
				else {
					// if new user, add point
					if (typeof markers[index] == 'undefined') {
						if (this.online == 1) {
							var p = {latitude: this.lat, longitude: this.long};
							add_point(p, false, {username: this.username, id: this.id});
						}
					}
					
					// if user already on map, update point only if position changed
					else {
//						console.log(markers[index].lat +' =? '+ this.lat + ' | ' + markers[index].long +' =? '+ this.long)
						if (markers[index].lat != this.lat || markers[index].long != this.long) {
							markers[index].setMap(null);
							markers.splice(index, 1);
							
							var p = {latitude: this.lat, longitude: this.long};
							add_point(p, false, {username: this.username, id: this.id, lat: this.lat, long: this.long});
						}
					}
				}
				
			})
			
		})
	}, 1000);
	
	//clearInterval(x);
}

function listen() {
	var options = { frequency: 3000 };
    watchID = navigator.geolocation.watchPosition(listenOnSuccess, listenOnError, options);
}

function listenOnSuccess(position) {
	var params = {
		action: 'update_position',
		user: get_user().user,
		lat: position.coords.latitude,
		long: position.coords.longitude
	}
	
	add_point({latitude: position.coords.latitude, longitude: position.coords.longitude}, true);
	
	jQuery('#message').html(position.coords.latitude + ', ' + position.coords.longitude).show();
	
	$.post(url, params, function(data) {
	}, 'JSON')
}

function listenOnError(error) {
//	alert('code: '    + error.code    + '\n' +
//            'message: ' + error.message + '\n');
}


function map() {
	$('#map_canvas').gmap().bind('init', function(evt, map) {
		
		$('#map_canvas').gmap('getCurrentPosition', function(position, status) {
			if ( status === 'OK' ) {
				add_point(position.coords, true);
			}
		});
		
	});
}

var marker_me;

function add_point(position, me, user) {
	if (me == undefined) {
		me = false;
	}
	
	var infoWindow = new google.maps.InfoWindow({});
	
	if (me) {
		if (marker_me) {
			marker_me.setMap(null);
		}
		
		var clientPosition = new google.maps.LatLng(position.latitude, position.longitude);
		$('#map_canvas').gmap('addMarker', {'position': clientPosition, 'bounds': true, 'icon': 'images/me.png'}, function(map, marker) {
			marker_me = marker;
			google.maps.event.addListener(marker, 'click', function() {
			    infoWindow.setContent('THIS IS ME');
			    infoWindow.open(map,marker);
			});
			$('#map_canvas').gmap('option', 'zoom', 15);
		});
		
		$('#map_canvas').gmap('addShape', 'Circle', {
			'strokeWeight': 0, 
			'fillColor': "#008595", 
			'fillOpacity': 0.25, 
			'center': clientPosition, 
			'radius': 100, 
			'clickable': false 
		});
		
		var u = get_user();
		$.post(url, {action: 'location', position: position, user: u.user}, function(data) {
		}, 'JSON')
	}
	else {
		var clientPosition = new google.maps.LatLng(position.latitude, position.longitude);
		$('#map_canvas').gmap('addMarker', {'position': clientPosition}, function(map, marker) {
			marker.user = user.id;
			marker.lat = user.lat;
			marker.long = user.long;
			marker.p = {lat: position.latitude, long: position.longitude};
//			markers.push(marker);
			markers[user.id] = marker;
			google.maps.event.addListener(marker, 'click', function() {
			    infoWindow.setContent(user.username + '<br /><br /><a href="#" class="send_message_open" rel="' + user.id + '" rev="' + user.username + '">Send message</a>');
			    infoWindow.open(map,marker);
			});
		});
	}
}

function get_user() {
	var str = localStorage.getItem('_app_data');
	return JSON.parse(str);
}

function message(text) {
	if (typeof navigator.notification == 'undefined') {
		alert(text);
	}
	else {
		navigator.notification.alert(text, function(){}, 'Title', 'OK');
	}
}

function is_logged() {
	var str = localStorage.getItem('_app_data');
	if (str == null) {
		return false;
	}
	var data = JSON.parse(str);
	return (data  != null && typeof data.logged_in != 'undefined' && data.logged_in == 1);
}

var getLocation = function() {
    var suc = function(p) {
        alert(p.coords.latitude + " " + p.coords.longitude);
    };
    var locFail = function() {
    };
    navigator.geolocation.getCurrentPosition(suc, locFail);
};


var pictureSource;   // picture source
var destinationType; // sets the format of returned value 

// Wait for PhoneGap to connect with the device
//
document.addEventListener("deviceready",onDeviceReady,false);

// PhoneGap is ready to be used!
//
function onDeviceReady2() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64 encoded image data
  // console.log(imageData);

  // Get image handle
  //
//	alert(imageData);
  var smallImage = document.getElementById('smallImage');

  // Unhide image elements
  //
  smallImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
//  smallImage.src = "data:image/jpeg;base64," + imageData;
  smallImage.src = imageData;
  
  upload_photo(imageData);
}

//Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  // console.log(imageURI);

  // Get image handle
  //
  var largeImage = document.getElementById('smallImage');

  // Unhide image elements
  //
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageURI;
  
  
  upload_photo(imageURI);
}

function upload_photo(fileURI) {
	var options = new FileUploadOptions();
	options.fileKey="file";
	options.fileName=fileURI.substr(fileURI.lastIndexOf('/')+1);
	options.mimeType="image/jpeg";

	var params = new Object();
	params.user = get_user().user;
	
	options.params = params;

	var ft = new FileTransfer();
	ft.upload(fileURI, url + '?action=upload_photo', upload_photo_win, upload_photo_fail, options);
}

function upload_photo_win (r) {
	message('Photo uploaded');
//	console.log("Code = " + r.responseCode);
//	console.log("Response = " + r.response);
//	console.log("Sent = " + r.bytesSent);
}

function upload_photo_fail (error) {
	message('An error has occurred: Code = ' + error.code);
}

function capturePhoto() {
	if ( ! is_logged()) {
		message('Please login');
		return false;
	}
    // Take picture using device camera and retrieve image as base64-encoded string
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 80 });
}

function getPhoto() {
	if ( ! is_logged()) {
		message('Please login');
		return false;
	}
	
	var source = pictureSource.PHOTOLIBRARY;
	//pictureSource.SAVEDPHOTOALBUM

    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
      destinationType: destinationType.FILE_URI,
      sourceType: source });
}

function onFail(message) {
	alert('Failed because: ' + message);
}
