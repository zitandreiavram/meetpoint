//var url = 'http://localhost/meetpoint/dev/app/';
var url = 'http://www.crma.ro/meetpoint/dev/app/';

jQuery(document).ready(function($) {
	
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
	
	$('#login_action').bind('click', function() {
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
			localStorage.removeItem('_app_data');
		})
	})
	
	$('#show_the_map').bind('click', function() {
		$('#send_message').hide();
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
	
	$.getJSON(url, {action: 'get', user: user.user}, function(data) {
		
		for (var i = 0; i < markers.length; i++ ) {
			markers[i].setMap(null);
			markers.splice(update, 1);
		}
		
		$(data.points).each(function() {
			var p = {latitude: this.lat, longitude: this.long};
			add_point(p, false, {username: this.username, id: this.id});
		})
		
	})
	
	
	/*
	var x = window.setInterval(function() {
		$.getJSON(url, {action: 'get', user: user.user}, function(data) {
			
			for (var i = 0; i < markers.length; i++ ) {
				markers[i].setMap(null);
				markers.splice(update, 1);
			}
			
			$(data.points).each(function() {
				var p = {latitude: this.lat, longitude: this.long};
				add_point(p, false, {username: this.username, id: this.id});
			})
			
			
			if (data.points) {
				$(data.points).each(function() {
					var update = true;
					
					for (var i = 0; i < markers.length; i++ ) {
						
						if (markers[i].user == this.id) {
							update = false;
							
							if (markers[i].lat != this.lat && markers[i].long != this.long) {
								update = i;
							}
						}
					}
					
					if (update !== false) {
						if (typeof update == 'number') {
							markers[update].setMap(null);
							markers.splice(update, 1);
						}
						
						var p = {latitude: this.lat, longitude: this.long};
						add_point(p, false, {username: this.username, id: this.id});
					}
					
				})
				
			}
		})
	}, 1000);
	*/
	//clearInterval(x);
}

function listen() {
	
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

function add_point(position, me, user) {
	if (me == undefined) {
		me = false;
	}
	
	var infoWindow = new google.maps.InfoWindow({});
	
	if (me) {
		var clientPosition = new google.maps.LatLng(position.latitude, position.longitude);
		$('#map_canvas').gmap('addMarker', {'position': clientPosition, 'bounds': true, 'icon': 'images/me.png', 'animation': google.maps.Animation.DROP}, function(map, marker) {
			google.maps.event.addListener(marker, 'click', function() {
			    infoWindow.setContent('THIS IS ME');
			    infoWindow.open(map,marker);
			});
		});
		
		$('#map_canvas').gmap('addShape', 'Circle', {
			'strokeWeight': 0, 
			'fillColor': "#008595", 
			'fillOpacity': 0.25, 
			'center': clientPosition, 
			'radius': 15, 
			'clickable': true 
		});
		
		var u = get_user();
		$.post(url, {action: 'location', position: position, user: u.user}, function(data) {
		}, 'JSON')
	}
	else {
		var clientPosition = new google.maps.LatLng(position.latitude, position.longitude);
		$('#map_canvas').gmap('addMarker', {'position': clientPosition}, function(map, marker) {
			marker.user = user.id;
			marker.p = {lat: position.latitude, long: position.longitude};
			markers.push(marker);
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
	jQuery('#message').html(text).show();
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
function onDeviceReady() {
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
}

//Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  // console.log(imageURI);

  // Get image handle
  //
	alert(imageURI);
  var largeImage = document.getElementById('smallImage');

  // Unhide image elements
  //
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageURI;
}

function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 80 });
}

function getPhoto() {
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
