include
	.use('Utils')
	.js('ITimeTrigger.es6')
	.done(function(resp, Utils){
				
		include.exports = Class('Trigger.OnceTrigger', {
			Base: resp.ITimeTrigger,
			
			Construct: function(){
				
				if (this.date == null && typeof this.rule === 'string') 
					this.date = Utils.Parser.OnceExpression(this.rule, this.created);
				
				
				if (this.date == null && this.rule) 
					this.date = new Date(this.rule);
				
			},
			
			date: null,
			
			hasNext: function(){
				return this.date >= new Date;
			},
			
			getNext: function(){
				return this.hasNext()
					? this.date
					: null
					;
			},
			
			Static: {
				canHandle: function(rule){
					
					if (rule instanceof Date) 
						return true;
					
					if (typeof rule === 'string') {
						
						if (/^\s*(at|in|on) /.test(rule)) 
							return true;
						
						if (/^\d{4}-\d{2}-\d{2}/.test(rule))
							return true;
						
						return false;
					}
					
					
					return false;
				},
			}
		})
	});