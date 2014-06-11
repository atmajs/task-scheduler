include
	.use('Utils')
	.js(
		'trigger/Trigger.es6',
		'executor/Executor.es6'
	)
	.done(function(resp, Utils){
		
		include.exports = Class('Task', {
			Base: Class.Serializable({
				trigger: resp.Trigger,
				exec: resp.Executor
			}),
			
			_id: null,
			
			app: {
				_id: null,
				name: ''
			},
			
			name: '',
			
			//| Rule
			trigger: null,
			
			//| Exec object { ?src, ?script, ?command }
			exec: null,
			data: null,
			
			isEqual: function(task){
				if (task == null) 
					return false;
				
				if (this === task) 
					return true;
				
				if (this._id && areEquivalent(this._id, task._id) === true)
					return true;
				
				return areEquivalent(this.app._id, task.app._id)
					&& areEquivalent(this.trigger, task.trigger)
					&& areEquivalent(this.exec, task.exec)
					&& areEquivalent(this.data, task.data)
					;
			}
		});
		
		function areEquivalent(a, b) {
			if (null == a || a === '') 
				return a == b;
			
			if (null == a.isEqual) 
				return Utils.obj.isEqual(a, b);
			
			return a.isEqual(b);
		}
	})
