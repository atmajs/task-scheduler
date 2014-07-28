include
	.load('./tasks.mask')
	.css('./tasks.less')
	.done(resp => {
		
		mask.registerHandler(':view:tasks', Compo({
			template: resp.load.tasks,
			
			onRenderStart: function(){
				
			}
		}))
		
	});