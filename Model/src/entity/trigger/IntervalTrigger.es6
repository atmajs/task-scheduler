include
	.use('Utils')
	.js('ITimeTrigger.es6')
	.done(function(resp, Utils){
				
		include.exports = Class('Trigger.OnceTrigger', {
			Base: resp.ITimeTrigger,
			
			// - interval in milliseconds
			_rule: null,
			
			Construct: function(){
				if (this._rule == null && typeof this.rule === 'string') 
					this._rule = Utils.Parser.IntervalExpression(this.rule, this.created);
			},
			
			date: null,
			
			hasNext: function(){
				return true;
			},
			
			getNext: function(){
				var date = new Date,
					rest = (date - this.created) % this._rule,
					diff = this._rule - rest
					;
				
				date.setMilliseconds(date.getMilliseconds() + diff);
					
				
				return date;
			},
			Static: {
				canHandle: function(rule){
					if (typeof rule === 'string') {
						
						if (/^\s*(interval) /.test(rule)) 
							return true;
						
						return false;
					}
					
					
					return false;
				},
			}
		})
	});