include 
	.load('./editor.mask::Template') 
	.css('./editor.less')
	.js(
		'./input-exec/input-exec.es6',
		'./input-trigger/input-trigger.es6',
		'./editorActions/editorActions.es6'
	)
	.use('Model.Task', 'Model.Applications')
	.done(function(resp, Task, Apps){

		mask.registerHandler(':view:editor', Compo({
			template: resp.load.Template,
			scope: {
				listDirectory (query, cb) {
					if (query.length < 2) 
						return;
					$.getJSON('/rest/system/io/directory/list', {
						path: query
					})
					.done(x =>  cb(x.entries));
				}
			},
			onRenderStart (model, ctx, container) {
				this.model = {};
				return new Class.Await(
					this.getTask_(ctx.page.query.id),
					this.getApps_()
				);
			},
			getTask_ (id) {
				return Class.Deferred.run((resolve, reject) => {
					if (id == null) {
						this.model.task = new Task();
						return resolve();
					}
					
					Task
						.fetch({ _id: id })
						.then(task => this.model.task = task, reject)
						;
				})
			},
			getApps_ () {
				return Apps
					.fetch()
					.done(apps => {
						this.model.applications = apps;
					});
			}
		}));
	});
