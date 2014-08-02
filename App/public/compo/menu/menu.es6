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
			pipes: {
				viewManager: {
					navigate: function(page){
						this.model.current = page;
					}
				}
			},
			template: resp.load.Template,
			onRenderStart: function(model, ctx, container){
				
				var stat = Model
					.ModelRod
					.resolve('ServerStat')
					.done(Compo.pause(this, ctx))
					;
					
				this.model = {
					stat: stat,
					list: [
						'tasks',
						'queue',
						'active',
						'history',
						'workers'
					],
					current: ctx.page.data.id
				};
			}
		}));


	});
