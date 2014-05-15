include.exports = Class('Executor.IExecutor', {
	
	Base: Class.Serializable,
	Extends: Class.Deferred,
	
	process: function(app, task){
		// do the job
		return this;
	},
	
	isEqual: function(executor){
		return false;
	}
})