mask.registerHandler(':viewManager', Compo({
	tagName: 'section',
	onRenderStart: function(){
		this.nodes = jmask(this.nodes).wrap('.view');
	},
	onRenderEnd: function(){
		this._pages = {};
		this._resource = include;
		
		ruta.add('/:page', route => {
			var page = route.current.params.page,
				div = this._pages[page];
			if (div != null) {
				this._show(div);
				return;
			}
			
			this._emit('loadStart');
			$
				.getJSON('/' + page + '?partial=@content>*')
				.done(json => this._create(page, json))
				.fail(err => {
					this._emit('loadEnd');
					this._emit('error', err);
					console.error('<viewManager>', arguments);
				});
		})
	},
	_pages: null,
	_emit: function(event){
		Compo.pipe(':viewManager').emit(event);
	},
	_show: function(div){
		this
			.$
			.children()
			.detach()
			.end()
			.append(div)
			;
	},
	_create: function(page, json){
		this
			._resource
			.js(json.scripts)
			.css(json.styles)
			.done(() => {
				var div = document.createElement('div');
				div.className = 'view';
				div.innerHTML = json.html;
				
				this._pages[page] = div;
				this._emit('loadEnd', div);
				this._show(div);
				
				mask.Compo.bootstrap(div, this);
			});
	}
}))