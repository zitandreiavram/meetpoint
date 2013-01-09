var Lang = {
		
	en: {
		register: 'Register',
		login: 'Login',
	},
	
	fr : {
		register: 'Enregistrer',
		login: 'Identifier',
	},

	switch : function(lang) {
		$.i18n.setDictionary(this[lang]);

		$('.lang').each(function() {
			var $this = $(this);
			$this.text($.i18n._($this.attr('lang')))
		})
	}

}

