include
	.js('ITimeTrigger.es6')
	.done(function(resp){

		include.exports = Class('Trigger.CronTrigger', {
			Base: resp.ITimeTrigger,
			
			Construct: function(){
				var parser = require('cron-parser'),
					options = {
						currentDate: this.created
					};
				
				try {
					this._interval = parser.parseExpressionSync(this.rule, options)
				}catch(error){
					this._errored = error;
				}
				
			},
			
			_interval: null,
			_errored: null,
			
			hasNext: function(){
				if (this._interval == null) 
					return false;
				
				return this._interval.hasNext();
			},
			
			getNext: function(){
				if (this._interval == null) 
					return null;
				
				return this._interval.next();
			},
			
			Static: {
				canHandle: function(rule){
					var rgx_cron = /^( ?([\d\*]+(\/[\d\*]+)?)){4,8}$/;
					return typeof rule === 'string' && rgx_cron.test(rule);
				}
			}
		})		
		
	})
