//var url = 'http://localhost/meetpoint/dev/app/';
var url = 'http://www.crma.ro/meetpoint/dev/app/';

jQuery(document).ready(function($) {
	
	if (is_logged()) {
		$('.main').hide();
		$('.map').show();
		map();
		$('.logout').show();
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
		$.post(url, $('#login_form').serialize(), function(data) {
			if (data.result == 1) {
				$('.main, .message').hide();
				$('.map').show();
				var data = { 'logged_in': 1 };
				localStorage.setItem('_app_data', JSON.stringify(data));
				map();
				$('.logout').show();
			}
			else {
				message(data.message);
			}
		}, 'JSON')
	})
	
	$('#logout').bind('click', function() {
		$('.logout').hide();
		$('.main').show();
		$('.map').hide();
		localStorage.removeItem('_app_data');
	})
	
	$('#notification').bind('click', function() {
		navigator.notification.confirm('Message...', confirmCallback, 'Chat?', 'YES,NO');
		return false;
	})
	
	function confirmCallback(buttonIndex) {
		alert('You selected button ' + buttonIndex);
	}
	
	$('.send_message_open').live('click', function() {
		$('#to').text($(this).attr('rel'));
		$('#send_message').show();
		return false;
	})
	
	$('#send_message_action').bind('click', function() {
		$.post(url, $('#send_message_form').serialize(), function(data) {
			if (data.result = 1) {
				alert(data.message);
				$('#send_message').hide();
			}
		}, 'JSON')
	})

})

function map() {
	$('#map_canvas').gmap().bind('init', function(evt, map) {
		
		$('#map_canvas').gmap('getCurrentPosition', function(position, status) {
			if ( status === 'OK' ) {
				add_point(position.coords, true);
			}
		});
		
	});
}

var infoWindow = null

function add_point(position, me) {
	if (me == undefined) {
		me = false;
	}
	
	if (infoWindow == null) {
//		infoWindow = new google.maps.InfoWindow({});
	}
	
	var infoWindow = new google.maps.InfoWindow({});
	
	var clientPosition = new google.maps.LatLng(position.latitude, position.longitude);
	$('#map_canvas').gmap('addMarker', {'position': clientPosition, 'bounds': true, 'icon': 'images/me.png', 'animation': google.maps.Animation.DROP}, function(map, marker) {
		google.maps.event.addListener(marker, 'click', function() {
		    infoWindow.setContent('THIS IS ME');
		    infoWindow.open(map,marker);
		});
	});
	
	if (me) {
		$('#map_canvas').gmap('addShape', 'Circle', {
			'strokeWeight': 0, 
			'fillColor': "#008595", 
			'fillOpacity': 0.25, 
			'center': clientPosition, 
			'radius': 15, 
			'clickable': true 
		});
	}
	
	// other points
	for (var i = 0; i <= parseInt(5 + Math.random() * 10, 10); i++) {
		if (parseInt(Math.random() * 2, 10)) {
			var lat = position.latitude + Math.random() * 0.0002;
			var long = position.longitude + Math.random() * 0.0001;
		}
		else {
			var lat = position.latitude - Math.random() * 0.0001;
			var long = position.longitude - Math.random() * 0.0003;
		}
		
		var infoWindow = new google.maps.InfoWindow({});
		
		var clientPosition = new google.maps.LatLng(lat, long);
		$('#map_canvas').gmap('addMarker', {'position': clientPosition, 'animation': google.maps.Animation.DROP}, function(map, marker) {
			google.maps.event.addListener(marker, 'click', function() {
				var u = 'Random user ' + parseInt(5 + Math.random() * 10, 10);
			    infoWindow.setContent(u + '<br /><br /><a href="#" class="send_message_open" rel="' + u + '">Send message</a>');
			    infoWindow.open(map,marker);
			});
		});
	}
	
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

