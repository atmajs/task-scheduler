include
	.js('ITimeTrigger.es6')
	.done(function(resp){
		
		include.exports = Class('Trigger.RRuleTrigger', {
			Base: resp.ITimeTrigger,
			
			Construct: function(){
				var options = this.rule;
				if (typeof this.rule === 'string'){
					options = this.rule.indexOf('FREQ') !== -1
						? RRule.parseString(this.rule)
						: RRule.parseText(this.rule)
						;
				}
				
				options.dtstart = this.created;
				this._rrule = new RRule(options);
			},
			
			_rrule: null,
			_errored: null,
			
			
			hasNext: function(){
				return this.getNext() != null;
			},
			
			getNext: function(){
				if (this._rrule == null) 
					return null;
				
				return this._rrule.after(new Date);
			},
			
			Static: {
				canHandle: function(rule){
					
					if (typeof rule === 'string') {
						if (/every /i.test(rule))
							return true;
						
						if (/FREQ=/.test(rule)) 
							return true;
						
						return false;
					}
					
					if (rule && rule.freq) 
						return true;
					
					return false;
				}
			}
		})
	});