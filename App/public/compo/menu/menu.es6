include 
	.load('menu.mask::Template') 
	.css('menu.less')
	.use('Model')
	.done(function(resp, Model){
		
		mask.registerHandler(':menu', Compo({
			tagName: 'menu',
			attr: {
				'class': '-menu'
			},
			template: resp.load.Template,
			onRenderStart: function(model, ctx, container){
				
				this.model = {
					count: {
						workers: app.lib.Queue.Server.workerCount,
						active: app.lib.Queue.TaskQueue.length
					}
				};
				
				var resume = Compo.pause(this, ctx),
					dfrs = [
							['tasks', Model.Tasks],
							['history', Model.HistoryTasks]
						]
						.map(x => fetch(this.model.count, ...x))
						;
				
				new Class
					.Await(...dfrs)
					.always(resume)
					;
				
				function fetch(model, name, Ctor) {
					return Ctor
						.count()
						.done(count => model[name] = count)
						.fail(error => logger.error('Fetch `count` failed', name, error))
						;
				}
			},
			onRenderEnd: function(elements, model, ctx, container){
				
			}
		}));


	});
