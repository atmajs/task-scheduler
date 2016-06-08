include 
	.load('appModal.mask::Template')
	.use('Model.Application')
	.done(function(resp, App){
		
		mask.registerHandler(':appModal', Compo(':dialog', {
			template: resp.load.Template,
			meta: {
				mode: 'client'
			},
			slots: {
				dialog_Ok () {
					var err = this.validate();
					if (err) {
						this.model.message = err;
						return;
					}
					
					var app = new App({
						name: this.model.name,
						base: this.model.base
					});
					
					this.state(false)
					app
						.save()
						.fail(err => this.errored(err))
						.done(app => this.created(app))
						.always(() => this.state(true))
						;
				}
			},
			model: {
				name: '',
				base: '',
				message: '',
			},
			
			show () {
				this.model.message = '';
				this.model.name = 'Foo';
				this.model.base = 'D:/atma';
				this.super();
			},
			errored (err) {
				this.model.message = err.error;
			},
			created (app) {
				this.emitOut('appCreated', app);
				this.hide();
			},
			validate () {
				if (!this.model.name) 
					return 'Please enter the Applications name';
					
				if (!this.model.base) 
					return 'Please enter the Applications base path (cwd)';
			},
			
			state (active) {
				this.$.find('button').prop('disabled', !active);
			}
		}));
	});
