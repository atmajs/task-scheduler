include 
	.load('element.mask::Template') 
	.css('element.less') //
	.done(function(resp){

		mask.registerHandler(':element', Compo({
			template: resp.load.Template,

			pipes: {
				elements: {
					bar: function(action){
						console.log(action)
					}
				}
			},

			onRenderStart: function(model, ctx, container){
			},
			onRenderEnd: function(elements, model, ctx, container){
			},

		}));


	});
