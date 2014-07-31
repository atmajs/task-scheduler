include
	.load('./workers.mask')
	.done(resp => {
		
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
			formatTimespan: function(seconds) {
				seconds |= 0;
				var HOUR = 60 * 60,
					MIN  = 60;
				
				var h, m;
				h = seconds / HOUR | 0;
				seconds -= h * HOUR;
				
				m = seconds / MIN | 0;
				seconds -= m * MIN;
				
				var txt = '';
				if (h) 
					txt += h + ' h'
				
				if (h || m) 
					txt += ' ' + m + ' m and'
				
				return txt + ' ' + seconds + 's';
			}
		}));
	})
