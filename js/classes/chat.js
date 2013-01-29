var Chat = {
	
	list: null,
	chat_with: null,
	chat_with_username: null,
	chat_with_photo: null,
	getRequestInterval: null,
	getRequestIntervalTime: 3000,
	chatRequestId: null,
	startInterval: null,
	startIntervalTime: 1000,
	requestId: null,
	currentRequestId: null,
	lastMessageId: null,
	sending: false,
	
	init: function() {
		Chat.list = $('#chat');
	},

	sendRequest: function(user) {
		$.getJSON(url + 'main/chat/request', {from: User.id, to: user}, function(result) {
			User.currentRequestId = result.id;
			message(_(result.code));
		})
	},

	getRequest: function() {
		Chat.getRequestInterval = window.setInterval(function() {
			$.get(url + 'main/chat/check', {from: User.id, current: User.currentRequestId}, function(result) {
				if (result.last_request && typeof result.last_request.request_id != 'undefined') {
					Chat.requestId = result.last_request.request_id;
					confirmation(_('chat_request_from'), result.last_request.username, Chat.requestOnConfirm);
				}
				
				if (result.accepted_chat_with_user > 0) {
					Chat.start({
						id: result.accepted_chat_with_user,
						username: result.accepted_chat_with_user_username,
						photo: result.accepted_chat_with_user_photo,
					})
				}
			})
		}, Chat.getRequestIntervalTime)
	},
	
	requestOnConfirm: function(option) {
		$.get(url + 'main/chat/status', {from: User.id, request_id: Chat.requestId, status: option}, function(result) {
			if (option == 1) {
				Chat.start({
					id: result.user_id,
					username: result.user_username,
					photo: result.user_photo,
				});
			}
		})
	},
	
	start: function(u) {
		Chat.chat_with = u.id;
		Chat.chat_with_username = u.username;
		Chat.chat_with_photo = u.photo;
		
		Chat.startInterval = window.setInterval(function() {
			$.getJSON(url + 'main/chat/get', {from: User.id, to: Chat.chat_with, last_message_id: Chat.lastMessageId}, function(result) {
				Chat.update(result.messages);
			})
		}, Chat.startIntervalTime);
		
		$('#tab_profile, #tab_engine').hide();
		Map.hide();
		$('#tab_chat, #chat_send_area').show();
		$('.tab_chat').addClass('active');
		$('.tab').removeClass('active');
	},
	
	stop: function() {
		Chat.chat_with = null;
		clearInterval(Chat.startInterval);
	},
	
	update: function(messages) {
		if (messages.length == 0) {
			return false;
		}
		
		$(messages).each(function(i, el) {
			var mid = '_m_' + el.id;
			if ($('#' + mid).length == 0) {
				var u = '';
				var i = '';
				var chat_left = '';
				if (el.from == User.id && el.to == Chat.chat_with) {
					u = User.username;
					i = User.photo;
				}
				if (el.to == User.id && el.from == Chat.chat_with) {
					u = Chat.chat_with_username;
					i = Chat.chat_with_photo;
					chat_left = ' chat_line_left';
				}
				
				var text = '<div class="chat_line'+chat_left+'" id="' + mid + '">'
					+ '<div class="msg">'
						+ '<span class="username">'+ u +'</span>'
						+ '<span class="time">' + el.date + '</span>'
						+ '<span class="text">' + el.message + '</span>'
					+ '</div>'
					+ '<div class="avatar">'
						+ '<div class="avatar_img">'
							+ '<img src="'+ i +'" height="100%" />'
						+ '</div>'
					+ '</div>'
				+ '</div>';
				
				var html = text + Chat.list.html();
				Chat.list.html(html);
			}
		})
		
		Chat.lastMessageId = messages[messages.length - 1].id;
	},
	
	message: function() {
		if (Chat.sending == true) {
			return false;
		}
		
		Chat.sending = true;
		
		var data = {
			from: User.id,
			to: Chat.chat_with,
			message: $('#chat_message').val(),
			last_message_id: Chat.lastMessageId
		};
		
		$('#chat_message').val('')
		
		if ($.trim(data.message) == '') {
			Chat.sending = false;
			return false;
		}
		
		$.post(url + 'main/chat/message', data, function(result) {
			Chat.sending = false;
			Chat.update(result.messages);
		}, 'JSON')
	}

}