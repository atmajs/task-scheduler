include
	.load('./workers.mask')
	.use('Utils')
	.done((resp, Utils) => {
		mask.registerHandler(':view:workers', mask.Compo({
			tagName: 'section',
			template: resp.load.workers,
			
			onRenderStart: function(model, ctx){
				var resume = Compo.pause(this, ctx);
				
				app
					.execute('/rest/workers')
					.done(workers => {
						this.model = {
							list: workers
						};
						resume();
					})
					.fail(error => {
						this.model = {
							error: error
						};
						resume();
					});
			},
			formatTimespan: Utils.date.formatTimespan
		}));
	})
