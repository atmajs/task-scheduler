var ModelRod = include.exports = Class.patch('ModelRod', {
	_started: false,
	
	Construct () {
		this.bind();
	},
	
	bind () {
		if (this._started) 
			return;
		this._started = true;
		var notifiers = this.propertyChangeNotifiers;
		for (var prop in notifiers){
			notifiers[prop].call(this, this.changeDelegate(prop));
		}
	},
	unbind () {
		this.trigger('dispose');
	},
	changeDelegate (prop) {
		return (val) => {
			ModelRod.setProperty(this, prop, val);
			this.notify(prop, val);
		};
	},
	addEventListener (emitter, event, fn) {
		var delegate = (...args) => {
			fn.apply(this, args)
		};
		emitter.on(event, delegate);
		this.once('dispose', function(){
			emitter.off(event, delegate);
		});
	},
	notify (prop, value) {
		_webSockets && _webSockets.emit('/modelrod', 'change', {
			_id: this._id,
			type: 'update',
			property: prop,
			value: value
		});
	},
	Static: {
		bind (app) {
			_webSockets = app.webSockets;
			_webSockets.registerHandler('/modelrod', (socket, io) => {
				// empty binder
			})
		}
	}
});

atma.server.Application.on('listen', ModelRod.bind);

// ==== private
var _webSockets,
	_store = {};

