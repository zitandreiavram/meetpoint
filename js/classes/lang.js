var Lang = {
	current: null,
	
	init: function() {
		this.current = default_language;
		this.set(default_language);
	},

	set: function(lang) {
		$.i18n.setDictionary(window[lang]);

		$('.lang').each(function() {
			var $this = $(this);
			$this.text($.i18n._($this.attr('lang')))
			$this.attr('placeholder', $.i18n._($this.attr('lang')))
		})
	}

}

