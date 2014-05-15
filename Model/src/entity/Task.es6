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
			
			name: '',
			
			//| Rule string
			trigger: null,
			
			//| Exec object { ?src, ?script }
			exec: null,
			data: null,
			
			isEqual: function(task){
				
				if (task._id != null
						&& this._id != null
						&& this._id.toString() === task._id.toString()) 
					return true;
				
				if (this.trigger == null && task.trigger != null) 
					return false;
				if (this.trigger && this.trigger.isEqual(task.trigger) === false) 
					return false;
				
				if (this.exec == null && task.exec != null) 
					return false;
				if (this.exec && this.exec.isEqual(task.exec) === false)
					return false;
				
				if (this.data == null && task.data != null) 
					return false
				if (this.data && Utils.obj.isEqual(this.data && task.data) == false) 
					return false;
				
				return true;
			}
		})	
	})
