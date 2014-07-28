include
	.load('./workers.mask')
	.done(resp => {
		
		mask.registerHandler(':view:workers', mask.Compo({
			tagName: 'section',
			template: resp.load.workers,
		}));
	})
