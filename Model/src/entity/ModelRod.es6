include
	.use('Utils.obj')
	.done(function(resp, Obj){

		var ModelRod = include.exports = Class('ModelRod', {
			Extends: [
				Class.Deferred,
				Class.Serializable,
				Class.EventEmitter,
			],
			Construct (x) {
				var id = x && x._id;
				if (id && Store[id] && this.constructor === ModelRod) {
					return new Store[id](x);
				}
				
				Cache[id] =  this;
			},
			_id: '',
			
			Static: {
				setProperty: Obj.setProperty,
				getProperty: Obj.getProperty,
				
				createCtor (proto) {
					if (proto._id == null) 
						logger.error('ModelRod id is not defined', proto);
						
					proto.Base = Class('ModelRod');
					return (Store[proto._id] = Class(proto));
				},
				
				register (name, proto) {
					proto.Base = Class('ModelRod');
					proto._id = name;
					return (Store[proto._id] = Class(proto));
				},
				resolve (name, id = ''){
					id = name + (id && ('.' + id));
					if (id in Cache) 
						return Cache[id];
					
					var Ctor = Store[name] || Class('ModelRod');
					var x = new Ctor({
						_id: id
					});
					
					return (Cache[id] = x);
				},
				get (id) {
					return Cache[id];
				}
			}
		});
		
		var Store = {},
			Cache = {};
	});
	