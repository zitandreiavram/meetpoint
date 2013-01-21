var Lang = {
	current: null,
	
	init: function() {
		var _app_saved_lang_ = localStorage.getItem('_app_saved_lang_');
		var lang = _app_saved_lang_ ? _app_saved_lang_ : default_language;
		this.set(lang);
	},

	set: function(lang) {
		if (lang == undefined || lang == '') {
			lang = default_language;
		}
		
		if (lang == this.current) {
			return false;
		}
		
		this.current = lang;
		localStorage.setItem('_app_saved_lang_', lang);
		
		$.i18n.setDictionary(window[lang]);

		$('.lang').each(function() {
			var $this = $(this);
			$this.text($.i18n._($this.attr('lang')))
			$this.attr('placeholder', $.i18n._($this.attr('lang')))
		})
		
		// extra
		$('.iPhoneCheckLabelOn span').text(_('f_short'))
		$('.iPhoneCheckLabelOff span').text(_('m_short'))
	}
}

function _(key) {
	return $.i18n._(key)
}