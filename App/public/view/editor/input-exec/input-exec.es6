include 
	.load('input-exec.mask::Template') 
	.css('input-exec.less') //
	.done(function(resp){

		mask.registerHandler(':input-exec', Compo({
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
				// ..
			},
			onRenderEnd: function(elements, model, ctx, container){
				// ..
			},
	
			//dispose: function(){
			//
			//}
		}));


	});
