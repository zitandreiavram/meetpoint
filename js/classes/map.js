var Map = {

	map_canvas: null,
	watchID: null,
	markers: [],
	marker_me: null,
	isLoaded: false,
	populateInterval: null,
	populateIntervalTime: 3000,
	
	init: function() {
		Map.map_canvas = $('#map_canvas');
		
		Map.map_canvas.gmap().bind('init', function(evt, map) {
			Map.isLoaded = true;
			
			Map.map_canvas.gmap('getCurrentPosition', function(position, status) {
				if ( status === 'OK' ) {
					Map.addPoint({me: true, lat: position.coords.latitude, long: position.coords.longitude, id: User.id, username: User.username});
					Map.show();
				}
			});
			
			Map.populate();
		});
	},
	
	destroy: function() {
		clearInterval(this.populateInterval);
	},
	
	show: function() {
//		Map.map_canvas.css('visibility', 'visible');
		if (Map.map_canvas) {
			Map.map_canvas.css('top', '67px');
		}
	},
	
	hide: function() {
//		Map.map_canvas.css('visibility', 'hidden');
		if (Map.map_canvas) {
			Map.map_canvas.css('top', '-9999px');
		}
	},
	
	addPoint: function(data) {
		
		var infoWindow = new google.maps.InfoWindow({});
		var clientPosition = new google.maps.LatLng(data.lat, data.long);
		
		if (data.me) {
			if (User.marker_me) {
				User.marker_me.setMap(null);
			}
			
			Map.map_canvas.gmap('addMarker', {'position': clientPosition, 'bounds': true, 'icon': 'images/me.png'}, function(map, marker) {
				User.marker_me = marker;
				google.maps.event.addListener(marker, 'click', function() {
				    infoWindow.setContent('THIS IS ME');
				    infoWindow.open(map,marker);
				});
				Map.map_canvas.gmap('option', 'zoom', 15);
			});
			
			/*
			Map.map_canvas.gmap('addShape', 'Circle', {
				'strokeWeight': 0, 
				'fillColor': "#008595", 
				'fillOpacity': 0.25, 
				'center': clientPosition, 
				'radius': 100, 
				'clickable': false 
			});
			*/
		}
		else {
			Map.map_canvas.gmap('addMarker', {'position': clientPosition}, function(map, marker) {
				marker.user = data.id;
				marker.lat = data.lat;
				marker.long = data.long;
				marker.p = {lat: position.latitude, long: position.longitude};
				Map.markers[data.id] = marker;
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
	
	populate: function() {
		this.populateInterval = window.setInterval(function() {
			$.getJSON(url + 'main/populate', {user: User.id}, function(result) {
				$(result.users).each(function() {
					var index = this.id;
					
//					for (var i = 0; i < Map.markers.length; i++ ) {
//						if (Map.markers[i].user == this.id) {
//							index = i;
//						}
//					}
					
					// if user no longer online, remove point
					if (this.online == 0) {
						if (typeof Map.markers[index] != 'undefined') {
							Map.markers[index].setMap(null);
							Map.markers.splice(index, 1);
						}
					}
					
					// if user still online
					else {
						// if new user, add point
						if (typeof Map.markers[index] == 'undefined') {
							if (this.online == 1) {
//								var p = {latitude: this.lat, longitude: this.long};
//								add_point(p, false, {username: this.username, id: this.id});
								Map.addPoint({lat: this.lat, long: this.long, id: this.id, username: this.username});
							}
						}
						
						// if user already on map, update point only if position changed
						else {
//							console.log(Map.markers[index].lat +' =? '+ this.lat + ' | ' + Map.markers[index].long +' =? '+ this.long)
							if (Map.markers[index].lat != this.lat || Map.markers[index].long != this.long) {
								Map.markers[index].setMap(null);
								Map.markers.splice(index, 1);
								
//								var p = {latitude: this.lat, longitude: this.long};
//								add_point(p, false, {username: this.username, id: this.id, lat: this.lat, long: this.long});
								Map.addPoint({lat: this.lat, long: this.long, id: this.id, username: this.username});
							}
						}
					}
					
				})
				
			})
		}, Map.populateIntervalTime);
	}
	
}