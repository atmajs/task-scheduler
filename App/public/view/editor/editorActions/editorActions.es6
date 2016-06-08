include 
	.load('editorActions.mask::Template') 
	.css('editorActions.less')
	.js('./appModal/appModal.es6')
	.done(function(resp){

		mask.registerHandler(':editorActions', Compo({
			template: resp.load.Template,
			meta: {
				mode: 'client'
			},
			slots: {
				viewManager_show () {
					this.animate('show');
				},
				closeEditor () {
					if (history.state == null) {
						ruta.navigate('/tasks');
						return;
					}
					this.animate('hide', () => window.history.back());
				},
				createApp () {
					this.find(':appModal').show();
				},
				removeApp (e) {
					var apps = this.model.applications,
						app = $(e.target).model(),
						index = apps.indexOf(app);
					
					apps.splice(index, 1);
					app.del();
				},
				
				appCreated (sender, app) {
					this.model.applications.push(app);
				}
			}
		}));
	});
