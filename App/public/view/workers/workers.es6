include
	.load('./workers.mask')
	.use('Utils')
	.done((resp, Utils) => {
		mask.registerHandler(':view:workers', mask.Compo({
			tagName: 'section',
			template: resp.load.workers,
			
			onRenderStart: function(model, ctx){
				return app
					.execute('/rest/workers')
					.done(workers => this.model = {
						list: workers
					})
					.fail(error => this.model = {
						error: error
					});
			},
			formatTimespan: Utils.date.formatTimespan
		}));
	})
