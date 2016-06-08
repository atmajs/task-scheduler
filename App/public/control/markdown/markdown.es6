include
	.js('marked.js')
	.done(function(resp) {
		
	var Marked = resp.marked || window.marked;

	var str_trimTrailings = (function() {

		var _cache_Regexp = {};

		return function(string) {
			var regexp_trailing = /^[\t ]+(?=[^\r\n]+)/m,
				count,
				match;

			match = regexp_trailing.exec(string);

			if (!match)
				return string;

			count = match[0].length;

			if (_cache_Regexp[count] == null)
				_cache_Regexp[count] = new RegExp('^[\\t ]{' + count + '}', 'gm');

			return string.replace(_cache_Regexp[count], '');
		};
	}());


	mask.registerHandler(':markdown', Compo({
		tagName: 'div',
		attr: {
			'class': '-markdown'
		},
		
		renderStart: function(model, cntx) {
			if (this.attr.src != null){
			    var that = this;
                
                Compo.pause(this, cntx);
                Compo
                    .resource(this)
                    .ajax(this.attr.src + '::Data')
                    .done(function(resp) {
                        
                        set_markdownContent(that, resp.ajax.Data);
						
                        Compo.resume(that, cntx);
                    });
                    
                return;
			}

			var md = str_trimTrailings(jmask(this).text());
			if (md) 
				set_markdownContent(this, md);
		},
		
		markdown: function(markdown){
			this.$.get(0).innerHTML = Marked(markdown);
		}
	}));

	function set_markdownContent(compo, str) {
		compo.nodes = jmask(':html').text(Marked(str));
	}
	
	
	Marked.setOptions({
		gfm: true,
		pedantic: false,
		sanitize: false,
		breaks: true,
		highlight: function(code, lang) {
			code = code.replace(/&nbsp;/g, ' ');
			
			if (typeof Prism === 'undefined')
				return code;
			
			if (lang in Prism.languages === false) 
				lang = 'javascript';

			
			return Prism.highlight(code, Prism.languages[lang]);
		}
	});

});