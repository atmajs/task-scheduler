mask.registerHandler(':list', Compo({
	meta: {
		attributes: {
			'?x-binded': 'boolean',
			'?x-model': function(name){
				var Ctor = Class(name);
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
		
		if (this.xModel == null) 
			return;
		
		var resume = Compo.pause(this, ctx);
		this
			.xModel
			.fetch()
			.done(instance => {
				this.model = instance;
				this.nodes = instance.length !== 0
					? jmask((this.xBinded ? '+' : '') + 'each (.)')
					: none
					;
				resume();
			});
	}
}))