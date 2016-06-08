include.exports = Class('Executor.IExecutor', {
	
	Base: Class.Serializable,
	Extends: Class.Deferred,
	name: '',
	process: function(app, task){
		throw new Error('Not implemented `Executor::trigger`')
	},
	isEqual: function(exec){
		return exec != null && this[this.name] === exec[this.name];
	},
	Static: {
		canHandle: function(data){
			throw new Error('Not implemented `Executor.canHandle`')
		},
	},
})