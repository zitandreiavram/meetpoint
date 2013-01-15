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
	
	if (User.isLogged()) {
		$('#loading').hide();
		$('#button_logout').removeClass('hidden');
		$('#footer').show();
		
		// Init user
		var _app_data = JSON.parse(localStorage.getItem('_app_data'));
		User.id = _app_data.id;
		User.username = _app_data.username;
		User.allow_search = _app_data.allow_search;
		
		// Display tabs
		$('#index').hide();
		$('#wrap').show();
		
		if (User.allow_search == true) {
			User.updatePresence();
			Map.init();
			$('.tab_map').addClass('active');
		}
		else {
			User.getProfile();
			$('#tab_profile').show();
		}
	}
	else {
		User.getCountries();
//		$('#form_login_email').val('zit_andreiavram@yahoo.com');
//		$('#form_login_password').val('parola');
//		User.login($('#form_login').serialize())
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
	
	$('#button_register').bind('click', function() {
		$('#index, #login').hide();
		$('#wrap, #register').show();
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
	
	$('#form_register_sex, #form_engine_sex').iphoneStyle({
		checkedLabel: 'F',
		uncheckedLabel: 'M'
	});
	
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
		// Save search engine options and start searching
		User.saveEngine();
	})
	
	$('#footer .tab').bind('click', function() {
		var $this = $(this);
		
		if ($this.is('.tab_map, .tab_chat, .tab_engine')) {
			if (User.allow_search == false) {
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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	return false;
	
	
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


function get_user() {
	var str = localStorage.getItem('_app_data');
	return JSON.parse(str);
}

function message(text) {
	if (typeof navigator.notification == 'undefined') {
		alert(text);
	}
	else {
		navigator.notification.alert(text, function(){}, _('notification_title'), _('notification_ok'));
	}
}

