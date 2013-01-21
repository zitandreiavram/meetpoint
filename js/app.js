// Wait for PhoneGap to connect with the device
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
//	Map.init();
	Lang.init();
	
	document.addEventListener("resume", onResume, false);
	document.addEventListener("pause", onPause, false);
}

function onResume() {
//	message('Resume');
//	$('#map_canvas').hide();
//	Map.init();
}

function onPause() {
//	message('Pause');
}

var watchID;

jQuery(document).ready(function($) {
	
	Lang.init();
	Chat.init();
	
	if (User.isLogged()) {
		$('#loading').hide();
		$('#button_logout').removeClass('hidden');
		$('#footer').show();
		
		// Init user
		var _app_data = JSON.parse(localStorage.getItem('_app_data'));
		User.id = _app_data.id;
		User.username = _app_data.username;
		User.allow_search = _app_data.allow_search;
		User.photo = _app_data.photo;
		
		// Display tabs
		$('#index').hide();
		$('#wrap').show();
		
		if (User.allow_search == true) {
			User.updatePresence();
			Chat.getRequest();
			Map.watchPosition();
			Map.init();
			$('.tab_map').addClass('active');
		}
		else {
			User.getProfile();
			$('#tab_profile').show();
			$('.tab_profile').addClass('active');
		}
		
		// Get data
		User.getData();
	}
	else {
		User.getCountries();
		
		/*
		// auto login
		$('#form_login_email').val('zit_andreiavram@yahoo.com');
		$('#form_login_password').val('parola');
		User.login($('#form_login').serialize())
		//*/
	}
	
	$('#home').bind('click', function() {
		$('#index').show();
		$('#wrap').hide();
		return false;
	})
	
	$('#button_login').bind('click', function() {
		$('#index, #register').hide();
		$('#wrap, #login').show();
	})
	
	$('#button_logout').bind('click', function() {
		User.logout();
	})
	
	$('#language_selector a').bind('click', function() {
		Lang.set($(this).attr('rel'))
	})
	
	var form_register_sex;
	
	$('#button_register').bind('click', function() {
		$('#index, #login').hide();
		$('#wrap, #register').show();
		form_register_sex = $('#form_register_sex').iphoneStyle({
			checkedLabel: _('f_short'),
			uncheckedLabel: _('m_short')
		});
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
	
	$('#photo_capture').bind('click', function() {
		Tools.capturePhoto();
	})
	
	$('#photo_library').bind('click', function() {
		Tools.getPhotoFromPhone();
	})
	
	$('#submit_profile').bind('click', function() {
		User.saveProfile();
	})
	
	$('#submit_search').bind('click', function() {
		User.saveEngine();
	})
	
	$('#footer .tab').bind('click', function() {
		var $this = $(this);
		
		if ($this.is('.tab_map, .tab_chat')) {
			if (User.allow_search == false) {
				$('#tab_profile').show();
				message(_('complete_profile_to_search'));
				return false;
			}
		}
		
		if ($this.is('.tab_engine')) {
			if (User.allow_search == false && User.has_profile == false) {
				$('#tab_profile').show();
				message(_('complete_profile_to_search'));
				return false;
			}
		}
		
		$('#index, .screen').hide();
		$('#wrap').show();
		
		$('#footer .tab').removeClass('active');
		$this.addClass('active');
		
		if ($this.hasClass('tab_map')) {
			if (Map.isLoaded == true) {
				Map.show();
				Map.populate();
			}
			else {
				$('#index').hide();
				$('#wrap').show();
				Map.init();
			}
		}
		else {
			if (Map.isLoaded == true) {
				Map.hide();
				Map.destroy();
			}
			
			$($this.attr('href')).show();
			
			if ($this.hasClass('tab_profile')) {
				User.getProfile();
			}
			
			if ($this.hasClass('tab_engine')) {
				User.getEngine();
			}
		}
	})
	
	// Chat
	$('.send_message_open').live('click', function() {
		var $this = $(this);
		
		var user = parseInt($this.attr('rel'), 10);
		Chat.sendRequest(user);
		
		return false;
	})
	
	$('#chat_send_message').bind('click', function() {
		Chat.message();
	})

})

function message(text) {
	if (typeof navigator.notification == 'undefined') {
		alert(text);
	}
	else {
		navigator.notification.alert(text, function(){}, _('notification_title'), _('notification_ok'));
	}
}

function confirmation(title, text, callback) {
	if (typeof navigator.notification == 'undefined') {
		var result = confirm(title + ' ' + text);
		var option = result == true ? 1 : 2;
		callback(option);
	}
	else {
		navigator.notification.confirm(text, callback, text)
	}
}
