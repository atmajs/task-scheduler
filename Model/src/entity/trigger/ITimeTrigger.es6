include
	.use('Utils')
	.done(function(resp, Utils){
		
		include.exports = Class('Trigger.ITrigger', {
			Base: Class.Serializable({
				created: Date
			}),
			
			Construct: function(){
				
				if (this.created == null) 
					this.created = new Date;
					
			},
			
			// (repeat) trigger rule
			rule: null,
			
			created: null,
			next: null,
			
			
			hasNext: function(){
				throw Error('`hasNext` not overriden');
			},
			
			getNext: function(){
				throw Error('`getNext` not overriden');
			},
			
			toJSON: function(){
				return this.rule;
			},
			isEqual: function(trigger){
				if (trigger == null) 
					return false;
				
				if (typeof this.rule === 'string') 
					return this.rule === trigger.rule;
				
				return Utils.obj.isEqual(this.rule, trigger.rule);
			},
			
		});
	})
