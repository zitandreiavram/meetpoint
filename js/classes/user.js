var User = {
		
	id: null,
	username: null,
	allow_search: false,
	countries: [],
	response: null,
	updatePresenceInterval: null,
	updatePresenceIntervalTime: update_presence_time,
	loadProfile: true,
	loadEngine: true,
	
	login: function(data) {
		navigator.geolocation.getCurrentPosition(function(position) {
			data += '&long=' + position.coords.longitude;
			data += '&lat=' + position.coords.latitude;
			
			$.post(url + 'main/login', data, function(result) {
				if (result.error == false) {
					User.id = parseInt(result.id, 10);
					User.username = result.username;
					User.allow_search = result.allow_search;
					
					var data = {'id' : result.id, 'username' : result.username, 'allow_search' : result.allow_search};
					localStorage.setItem('_app_data', JSON.stringify(data));
					
					$('#login, #register').hide();
					$('#button_login, #button_register').addClass('hidden');
					$('#button_logout').removeClass('hidden');
					$('#map_canvas').show();
					
					if (User.allow_search == true) {
						Map.init();
						Map.watchPosition();
					    User.updatePresence();
					}
					else {
						User.getProfile();
						$('#tab_profile').show();
					}
				    
				    $('#footer').show();
				}
				else {
					message(_(result.code));
				}
			}, 'JSON')
			
		}, function(){})
	},
	
	logout: function() {
		$.post(url + 'main/logout', {id: User.id}, function() {
			User.id = null;
			User.username = null;
			
			Map.hide();
			Map.destroy();
			navigator.geolocation.clearWatch(watchID);
			
			localStorage.removeItem('_app_data');
			clearInterval(User.updatePresenceInterval);
			
			$('#index').show();
			$('#wrap, #login, #register, #tab_profile, #tab_engine, #tab_chat').hide();
			
			$('#button_login, #button_register').removeClass('hidden');
			$('#button_logout').addClass('hidden');
			$('#footer').hide();
			
		}, 'JSON')
	},
	
	isLogged: function() {
		var str = localStorage.getItem('_app_data');
		if (str == null) {
			return false;
		}
		var data = JSON.parse(str);
		return (data  != null && typeof data.id != 'undefined');
	},
	
	register: function(data) {
		$.post(url + 'main/register', data, function(result) {
			if (result.error == false) {
				$('#register').hide()
				$('#login').show()
			}
			
			message(_(result.code))
		}, 'JSON')
	},
	
	getCountries: function() {
		$.getJSON(url + 'main/countries', function(result) {
			$(result.countries).each(function() {
				User.countries.push(this);
				User.populateCountriesSelect();
			})
		})
	},
	
	populateCountriesSelect: function() {
		var select = $('#form_register_country');
		
		select.empty();
		
		$(User.countries).each(function() {
			select.append($('<option />').val(this.id).text(this.name))
		})
		
		$('#loading').hide();
		$('#button_login, #button_register').removeClass('hidden');
	},
	
	getProfile: function () {
		if (User.loadProfile == false) {
			return false;
		}
		User.loadProfile = false;
		
		$.getJSON(url + 'main/profile', {user: User.id}, function(result) {
			$('#profile_sex').text(_(result.profile.sex));
			$('#profile_age').text(_(result.profile.age));
			
			var	a = result.profile.interests[0],
				b = result.profile.interests[1],
				c = result.profile.interests[2];
			
			// Interest 1
			var select = $('#profile_interests_1'); 
			select.empty().append($('<option />').val(0).text(''));
			$(result.interests).each(function() {
				var option = $('<option />').val(this.id).text(this[Lang.current]);
				
				if (parseInt(this.id, 10) == a) {
					option.attr('selected', 'selected')
				}
				
				select.append(option)
			})
			select.selectmenu();
			select.selectmenu('refresh', true);

			// Interest 2
			var select = $('#profile_interests_2'); 
			select.empty().append($('<option />').val(0).text(''));
			$(result.interests).each(function() {
				var option = $('<option />').val(this.id).text(this[Lang.current]);
				
				if (parseInt(this.id, 10) == b) {
					option.attr('selected', 'selected')
				}
				
				select.append(option)
			})
			select.selectmenu();
			select.selectmenu('refresh', true);
			
			// Interest 3
			var select = $('#profile_interests_3'); 
			select.empty().append($('<option />').val(0).text(''));
			$(result.interests).each(function() {
				var option = $('<option />').val(this.id).text(this[Lang.current]);
				
				if (parseInt(this.id, 10) == c) {
					option.attr('selected', 'selected')
				}
				
				select.append(option)
			})
			select.selectmenu();
			select.selectmenu('refresh', true);
			
			// Profession
			var select = $('#profile_profession');
			select.empty().append($('<option />').val(0).text(''));
			$(result.professions).each(function() {
				var option = $('<option />').val(this.id).text(this[Lang.current]);
				
				if (result.profile.profession == this.id) {
					option.attr('selected', 'selected')
				}
				
				select.append(option)
			})
			select.selectmenu();
			select.selectmenu('refresh', true);
			
			// Searching for
			/*
			var search = '';
			$(result.search).each(function() {
				var checked = result.profile.search.indexOf(this.id) > -1 ? ' checked' : '';
				search +=
					'<input class="select_at_least_one" type="checkbox" name="search[]" value="'+this.id+'" id="_search_'+this.id+'"' + checked + ' /> '
					+ '<label for="_search_'+this.id+'">'+this[Lang.current]+'</label><br /><br />';
			})
			$('#profile_search').html(search);
			*/
			
			if (result.profile.photo) {
				$('#profile_photo').attr('src', result.profile.photo).show();
			}
		})
	},
	
	saveProfile: function() {
		var form = $('#form_profile');
		var error = false;
		
		form.find('select.interests').each(function(i, el) {
			if ($(el).val() == 0) {
				error = true;
				return false;
			}
		})
		
		if ($('#profile_profession').val() == 0) {
			error = true;
		}
		
		/*
		var found_one = false;
		form.find('.select_at_least_one').each(function(i, el) {
			if ($(el).is(':checked')) {
				found_one = true;
			}
		})
		if (found_one == false) {
			error = true;
		}
		*/
		
		if ($('#profile_photo').attr('src') == '') {
			error = true;
		}
		
		if (error == true) {
			message(_('profile_submit_error'));
		}
		else {
			var data = form.serialize() + '&id=' + User.id;
			
			$.post(url + 'main/profile', data, function(result) {
				if (result.error == true) {
					message(_(result.code));
					return false;
				}
					
				User.response = result.code;
				
				// Upload photo
				var uri = $('#profile_photo_field').val();
				
				if (uri) {
					var options = new FileUploadOptions();
					options.fileKey = 'file';
					options.fileName = uri.substr(uri.lastIndexOf('/') + 1);
					options.mimeType = 'image/jpg';
		
					var params = new Object();
					params.user = User.id;
					
					options.params = params;
		
					var ft = new FileTransfer();
					ft.upload(uri, url + 'main/photo', User.uploadFileSucces, User.uploadFileFail, options);
				}
				else {
					User.uploadFileSucces();
				}
				
			}, 'JSON')
		}
	},
	
	getEngine: function() {
		// Searching for, Distance, Sex
		var search = '';
		var distance = '';
		if (User.loadEngine == false) {
			return false;
		}
		User.loadEngine = false;
		
		$.getJSON(url + 'main/engine', {user: User.id}, function(result) {

			$('#form_engine_sex').iphoneStyle({
				checkedLabel: _('f_short'),
				uncheckedLabel: _('m_short'),
				checked: result.selected_sex == 1
			});
			
			$(result.search).each(function() {
				var checked = result.selected_search.indexOf(parseInt(this.id, 10)) > -1 ? ' checked' : '';
				search +=
					'<input type="checkbox" class="at_least_one" name="search[]" value="'+this.id+'" id="_engine_search_'+this.id+'"' + checked + ' /> '
					+ '<label for="_engine_search_'+this.id+'">'+this[Lang.current]+'</label><br /><br />';
			})
			$('#engine_search').html(search);
			
			var search_select = $('#engine_distance');
			$(distance_options).each(function(i, el) {
				var option = $('<option />').val(el).text(_('distance_' + el));
				
				var index = result.selected_distance.indexOf(parseInt(el, 10));
				if (index > -1) {
					option.attr('selected', 'selected')
				}
				
				search_select.append(option)
			})
			search_select.selectmenu();
			search_select.selectmenu('refresh', true);
		})
		
	},
	
	saveEngine: function() {
		var form = $('#form_engine');
		var error = form.find('input.at_least_one:checked').length == 0;
		
		if (error == true) {
			return false;
		}
		
		var data = form.serialize() + '&id=' + User.id;
		
		$.post(url + 'main/engine', data, function(result) {
			User.allow_search = true;
			User.updatePresence();
			$('#tab_engine').hide();
			$('.tab').removeClass('active');
			$('.tab_map').addClass('active');
			
			if (Map.isLoaded == true) {
				Map.show();
				Map.populate();
			}
			else {
				Map.init();
			}
		}, 'JSON')
	},
	
	uploadFileSucces: function(r) {
		message(_(User.response));
		User.getEngine();
		$('#tab_engine').show();
		$('.tab').removeClass('active');
		$('.tab_engine').addClass('active');
		$('#tab_profile').hide();
		console.log($('.tab_profile'))
	},
	
	uploadFileFail: function(error) {
		
	},
	
	updatePresence: function() {
		if (User.updatePresenceInterval) {
			return false;
		}
		
		User.updatePresenceInterval = window.setInterval(function() {
			$.get(url + 'main/online', {user: User.id})
		}, User.updatePresenceIntervalTime)
		
	}

}