var Map = {

	map_canvas: $('#map_canvas'),
	watchID: null,
	markers: [],
	marker_me: null,
	
	init: function() {
		Map.map_canvas.gmap().bind('init', function(evt, map) {
			
			Map.map_canvas.gmap('getCurrentPosition', function(position, status) {
				if ( status === 'OK' ) {
					Map.addPoint({lat: position.coords.latitude, longitude: position.coords.longitude, id: User.id, username: User.username});
				}
			});
			
		});
	},
	
	addPoint: function(data) {
		
		var infoWindow = new google.maps.InfoWindow({});
		var me = data.id == User.id;
		var clientPosition = new google.maps.LatLng(position.latitude, position.longitude);
		
		if (me) {
			if (marker_me) {
				marker_me.setMap(null);
			}
			
			Map.map_canvas.gmap('addMarker', {'position': clientPosition, 'bounds': true, 'icon': 'images/me.png'}, function(map, marker) {
				marker_me = marker;
				google.maps.event.addListener(marker, 'click', function() {
				    infoWindow.setContent('THIS IS ME');
				    infoWindow.open(map,marker);
				});
				Map.map_canvas.gmap('option', 'zoom', 15);
			});
			
			Map.map_canvas.gmap('addShape', 'Circle', {
				'strokeWeight': 0, 
				'fillColor': "#008595", 
				'fillOpacity': 0.25, 
				'center': clientPosition, 
				'radius': 100, 
				'clickable': false 
			});
		}
		else {
			
			Map.map_canvas.gmap('addMarker', {'position': clientPosition}, function(map, marker) {
				marker.user = data.id;
				marker.lat = data.lat;
				marker.long = data.long;
				marker.p = {lat: position.latitude, long: position.longitude};
				markers[data.id] = marker;
				google.maps.event.addListener(marker, 'click', function() {
				    infoWindow.setContent(data.username + '<br /><br /><a href="#" class="send_message_open" rel="' + data.id + '" rev="' + data.username + '">Send message</a>');
				    infoWindow.open(map,marker);
				});
			});
		}
		
	},
	
	watchPosition: function() {
		
		var options = { frequency: 3000 };
	    this.watchID = navigator.geolocation.watchPosition(this.watchPositionSucces, this.watchPositionOnError, options);
		
	},
	
	watchPositionSucces: function(position) {
		
		var data = {
			id: User.id,
			long: position.coords.longitude,
			lat: position.coords.latitude
		}
			
		$.post(url + 'main/position', data, function(data) {
			Map.addPoint({lat: position.coords.latitude, longitude: position.coords.longitude, id: User.id, username: User.username});
		}, 'JSON')
		
	},
	
	watchPositionOnError: function() {
		
	},
	
}