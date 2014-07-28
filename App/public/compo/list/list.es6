mask.registerHandler(':list', Compo({
	meta: {
		attributes: {
			'?x-binded': 'boolean',
			'?x-model': function(name){
				var Ctor = Class.Model[name];
				return Ctor == null
					? Error(name + ' is not defined in Class repository')
					: Ctor;
			}
		}
	},
	
	attr: {
		'x-binded': false,
		'x-model': null
	},
	onRenderStart: function(model, ctx){
		var item = jmask(this).find('> @template > *');
		var none = jmask(this).find('> @empty > *');
		
		if (item == null) 
			item = this.nodes;
		
		this.nodes = jmask((this.xBinded ? '+' : '') + 'each (.)')
			.append(item);
		
		
		if (this.xModel == null) {
			return;
		}
		
		return Ctor
			.fetch()
			.done((instance) => {
				this.model = instance;
			});
	}
}))