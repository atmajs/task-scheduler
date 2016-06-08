(function(){
	
	mask.registerHandler(':resolver', Compo({
		
		onRenderStart: function(model, ctx, container){
			var resume = Compo.pause(this, ctx);
			var self = this;
			setTimeout(function(){
				self.model = {
					elements: resolveJSON()
				};
				resume();
			}, 1000);
			
		},
		onRenderEnd: function(elements, model, ctx, container){
			// ..
		},

	}));

	var elements = [
		'input',
		'button',
		'textarea'
	];
	
	function resolveJSON() {
		var arr = [];
		var count = 100;
		var i = -1;
		while( ++i < count ){
			arr.push(generate());
		}
		return arr;
	}
	function generate() {
		return {
			id: String(Math.random()),
			
			tag: 'input',
			//elements[
			//	Math.round(Math.random() * elements.length)
			//],
			left: Math.round(Math.random() * 1000),
			top: Math.round(Math.random() * 1000),
			width: 100,
			
			action: 'abc'
		};
	}
	
}());