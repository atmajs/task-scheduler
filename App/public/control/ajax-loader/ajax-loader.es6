include 
	.css('ajax-loader.less')
	.done(function(resp){

		mask.registerHandler(':ajax-loader', Compo.createClass({
			
			tagName: 'div',
			attr: {
				'class' : '-ajax-loader'
			},
			slots: {
				domInsert: function(){
					Class.Remote.onBefore(this.defer);
					Class.Remote.onAfter(this.resolve, this.error);
				}
			},
			count: 0,
			Self: {
				defer: function(){
					if (++this.count !== 1) 
						return;
					
					this.$.toggle(true);
				},
				resolve: function(){
					if (--this.count > 0) 
						return;
					
					this.count = 0;
					this.$.toggle(false);
				},
				
				error: function(sender, type, error){
					this.resolve();
				}
			}
		}));
	});
