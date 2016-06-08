include 
	.load('input-exec.mask::Template') 
	.css('input-exec.less')
	.use('Model.Task')
	.done(function(resp, Task){

		mask.registerHandler(':input-exec', Compo({
			template: resp.load.Template,
			onRenderStart (task) {
				var exec = task.exec;
				var current = exec != null
					? exec.name
					: 'src';
					
				this.model = {
					src: exec && exec.src,
					shell: exec && exec.shell && exec.shell,
					script: exec && exec.script,
					current: current
				};
			},
			generateExecutor () {
				var current = this.find('a:tabs').getActiveName();
				var val = this.model[current];
				var obj = { [current]: val };
				
				return Task.parseExecutor(obj);
			}
		}));
	});
