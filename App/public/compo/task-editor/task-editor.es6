include 
	.load('task-editor.mask::Template') 
	.css('task-editor.less') //
	.done(function(resp){

		mask.registerHandler(':task-editor', Compo(':dialog', {
			template: resp.load.Template,


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
