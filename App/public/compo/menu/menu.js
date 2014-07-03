include 
	.load('menu.mask::Template') 
	.css('menu.less') //
	.done(function(resp){

		mask.registerHandler(':menu', Compo({
			template: resp.load.Template,

			//compos: {
			//
			//},
			//events: {
			//
			//},
			//slots: {
			//
			//},
			//pipes: {
			//
			//},
			//constructor: function(){
			//
			//},

			onRenderStart: function(model, ctx, container){
				
			},
			onRenderEnd: function(elements, model, ctx, container){
				// ..
			},
	
			//dispose: function(){
			//
			//}
		}));


	});
