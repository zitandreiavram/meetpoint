var User = {
		
	id: null,
	username: null,
	countries: [],
	
	login: function(data) {
		navigator.geolocation.getCurrentPosition(function(position) {
			data += '&long=' + position.coords.longitude;
			data += '&lat=' + position.coords.latitude;
			
			$.post(url + 'main/login', data, function(result) {
				if (result.error == false) {
					User.id = parseInt(result.id, 10);
					User.username = result.username;
					
					var data = {'id' : result.id, 'username' : result.username};
					localStorage.setItem('_app_data', JSON.stringify(data));
					
					Map.init();
					
					var options = { frequency: 3000 };
				    User.watchID = navigator.geolocation.watchPosition(listenOnSuccess, listenOnError, options);
					
//					listen();
//					map();
//					populate();
//					$('.logout').show();
				}
				else {
					message(result.code);
				}
			}, 'JSON')
			
		}, function(){})
	},
	
	logout: function() {
		console.log(this.id);
		$.post(url + 'main/logout', {id: this.id}, function() {
			this.id = null;
			this.username = null;
//			$('.logout').hide();
//			$('.main').show();
//			$('.map').hide();
//			$('#send_message').hide();
			navigator.geolocation.clearWatch(watchID);
			localStorage.removeItem('_app_data');
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
			console.log(result);
		}, 'JSON')
	},
	
	getCountries: function() {
		$.get(url + 'main/countries', function(result) {
			$(result.countries).each(function() {
				User.countries.push(this);
				User.populateCountriesSelect();
			})
		})
	},
	
	populateCountriesSelect: function(){
		  var select = $('#form_register_country'),
		      tempSelect = $('<select />');
		 
		  $( User.countries ).each(function(index, opt){
		    var option = $('<option />').attr({
		      value : opt.id
		    }).text( opt.name );
		    option.appendTo( tempSelect );
		  });
		 
		  select.html( tempSelect.html() );
		  delete tempSelect;
		},//populateCountriesSelect
	
	populateCountriesSelect2: function() {
		var select = $('#form_register_country');
		
		//select.empty();
		
		$(User.countries).each(function() {
			select.append($('<option />').val(this.id).text(this.name))
		})
	}
	
}