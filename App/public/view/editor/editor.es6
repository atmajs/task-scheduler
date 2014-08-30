include 
	.load('editor.mask::Template') 
	.css('editor.less') //
	.use('Model.Task')
	.done(function(resp, Task){

		mask.registerHandler(':view:editor', Compo({
			template: resp.load.Template,
			onRenderStart (model, ctx, container) {
				var id = ctx.page.query.id;
				if (id == null) {
					this.model = { task: new Task };
					return;
				}
				
				return Task
					.fetch({ _id: id })
					.done(task => this.model = { task: task })
					.fail(error => this.model = null)
					;
			}
		}));
	});
