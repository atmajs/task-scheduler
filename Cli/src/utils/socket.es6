include.exports = {
	ensurePort: function(num){
		var dfr = new Class.Deferred;
		isAvailable(num, function(available){
			dfr[
				available ? 'resolve' : 'reject'
			]();
		})
		return dfr;
	}
};

function isAvailable(port, callback) {
	var socket = new (require('net').Socket),
		opened;
	socket.on('connect', function() {
		socket.end();
		opened = true;
	});
	socket.setTimeout(500)
	socket.on('timeout', function() {
		opened = false;
		socket.destroy()
	});
	socket.on('error', function(exception) {
		opened = false;
	});
	socket.on('close', function() {
		callback(opened === false);
	});
	socket.connect(port);
}
