mask.registerHandler(':viewManager', Compo({
	tagName: 'section',
	onRenderStart: function(){
		this.nodes = jmask('.view').append(this.nodes);
	},
	onRenderEnd: function(){
		this._pages = {};
		this._resource = include;
		
		ruta.add('^/:page', route => {
			var path = route.current.path;
			var page = route.current.params.page,
				data = this._pages[path];
			this._emit('navigate', page);
			
			if (data != null) {
				this._show(data);
				return;
			}
			
			this._emit('loadStart');
			$
				.getJSON(path + '?partial=@content>*')
				.done(json => this._create(path, json))
				.fail(err => {
					this._emit('loadEnd');
					this._emit('error', err);
					console.error('<viewManager>', arguments);
				});
		})
	},
	_pages: null,
	_current: null,
	_emit (...args) {
		Compo.pipe('viewManager').emit(...args);
	},
	_notifyChildren (signal, ...args) {
		if (this._current != null) 
			Compo.signal.emitIn(this._current.compo, signal, ...args);
	},
	_show: function(data){
		if (this._current === data) 
			return;
		
		this._notifyChildren('viewManager_hide');	
		this._current = data;
		this
			.$
			.children()
			.detach()
			.end()
			.append(data.panel)
			;
		this._notifyChildren('viewManager_show');
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
				
				this._emit('loadEnd', div);
				
				var data = {
					panel: div,
					compo: mask.Compo.bootstrap(div, this)
				};
				this._pages[page] = data
				this._show(data);
			});
	}
}))