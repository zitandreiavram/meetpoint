var Map = {

	map_canvas: null,
	watchID: null,
	markers: [],
	marker_me: null,
	isLoaded: false,
	populateInterval: null,
	populateIntervalTime: populate_map_time,
	
	init: function() {
		Map.map_canvas = $('#map_canvas');
		
		Map.map_canvas.gmap().bind('init', function(evt, map) {
			Map.isLoaded = true;
			
			Map.map_canvas.gmap('getCurrentPosition', function(position, status) {
				if ( status === 'OK' ) {
					Map.addPoint({
						me: true,
						lat: position.coords.latitude,
						long: position.coords.longitude,
						id: User.id,
						username: User.username,
						photo: User.photo,
					});
					Map.show();
//					Map.demo(position.coords);
				}
			});
			
			Map.populate();
		});
	},
	
	demo: function(from) {
		for (var i = 0; i < 10; i++) {
			var rand1 = Math.random() * (0.005 - -0.005) + -0.005;
			var rand2 = Math.random() * (0.005 - -0.005) + -0.005;
			
			var p = {
				lat: from.latitude + rand1,
				long: from.longitude + rand2,
				id: rand1,
				username: 'Utilisateur'
			};
			Map.addPoint(p);
			console.log(p)
		}
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
				    infoWindow.setContent('<img src="'+data.photo+'" width="150" />');
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
//				marker.p = {lat: position.latitude, long: position.longitude};
				marker.p = {lat: clientPosition.latitude, long: clientPosition.longitude};
				Map.markers[data.id] = marker;
				
				var distance_type = data.distance < 1 ? 'distance_m' : 'distance_km';
				
				var html = '<p class="infowindow">'
					+ '<img src="' + data.photo + '" width="150" />'
					+ '<br />'
					+ '<strong>' + data.username + '</strong>'
					+ '<br />'
					+ _('situated') + data.distance + _(distance_type)
					+ '<br />';
				
				var interests_list = '';
				$(data.interests).each(function(i, id) {
					$(User.data.interests).each(function(j, interest) {
						if (id == interest.id) {
							interests_list += interest[Lang.current]+ ', ';
						}
					})
				})
				html += interests_list.substr(0, interests_list.length - 2);
				
				html += '<br />';
				html += '<a href="#" class="send_message_open" rel="' + data.id + '" rev="' + data.username + '">' + _('send_message') + '</a>';
				html += '</p>';

				google.maps.event.addListener(marker, 'click', function() {
				    infoWindow.setContent(html);
				    infoWindow.open(map, marker);
				});
			});
		}
		
	},
	
	watchPosition: function() {
		return false;
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
			Map.addPoint({
				me: true,
				lat: position.coords.latitude,
				longitude: position.coords.longitude,
				id: User.id,
				username: User.username,
				photo: User.photo,
			});
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
//						var p = {
//							lat: this.lat,
//							long: this.long,
//							id: this.id,
//							username: this.username,
//							photo: this.photo
//						};
						
						var p = this;
						// if new user, add point
						if (typeof Map.markers[index] == 'undefined') {
							if (this.online == 1) {
//								var p = {latitude: this.lat, longitude: this.long};
//								add_point(p, false, {username: this.username, id: this.id});
								Map.addPoint(p);
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
//								Map.addPoint({lat: this.lat, long: this.long, id: this.id, username: this.username});
								Map.addPoint(p);
							}
						}
					}
					
				})
				
			})
		}, Map.populateIntervalTime);
	}
	
}