include
	.use('Utils')
	.done(function(resp, Utils){
		include.exports = Class.patch('Application', {
			
			Store: Class.MongoStore.Single({
				collection: 'applications',
				indexes: [
					[ {name: 1}, {unique: true} ]
				]
			}),
			
			
			Static: {
				/* { name, password, base, } */
				create: function(data){
					if (data.password.length !== 32) 
						data.password = Utils.crypto.md5(data.password);
					return new this(data).save();
				},
				
				get: function(name, password){
					if (password.length !== 32) 
						password = Utils.crypto.md5(password);
						
					this
						.fetch({
							name: name
						})
						.fail( error =>
							dfr.reject({ code: 404 })
						)
						.done( app => {
							if (password !== app.password)
								return dfr.reject({ code: 403 });
							
							return dfr.resolve(app);
						});
				}
			}
		});
	})
