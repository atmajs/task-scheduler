include 
	.load('elements.mask::Template')
	.js('./element/element.js')
	.done(function(resp){

		mask.registerHandler(':elements', Compo({
			template: resp.load.Template,

			slots: {
				foo: function(event){
					
					var el = event.currentTarget;
					var action = $(el).data('fn');
					
					Compo
						.pipe('elements')
						.emit('bar', action)
						;
				}
			}
		}));
	});
