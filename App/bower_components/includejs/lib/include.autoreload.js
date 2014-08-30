
// source ../src/20.Autoreload.js
(function(global) {

	if (typeof io !== 'undefined' && io.sockets) {
		SocketIOReady();
	}else{
		global
			.include
			.instance()
			.embed('/socket.io/socket.io.js')
			.done(SocketIOReady);	
	}
	
	function SocketIOReady() {
		if (!global.io) {
			return;
		}

		var socket = global.io.connect('/browser');

		socket.on('filechange', function(path) {
			console.log('Changed:', path);

			fileChanged(path);
		});
	}


	function fileChanged(path) {
		var ext = /\w+$/g.exec(path)[0],
			resource = include.getResource(path);

		if (resource){
			if (resource.reload){
				XHR(path, function(path, response) {
					global.include = resource;
					resource.reload(response);
				});
				return;
			}

			if (resource.type === 'load' && resource.parent && resource.parent.reload){
				XHR(resource, function(resource, response) {
					resource.exports = response;
					resource.parent.includes = [];
					fileChanged(resource.parent.url);
				});
				return;
			}

		}


		var handler = Handlers[ext];

		if (handler) {
			handler(path);
			return;
		}
		
		
		global.location.reload();
	}


	var Handlers = {
		css: handler_Css,
		less: handler_Css
	}
	
	function handler_Css(path) {
		var styles = document.getElementsByTagName('link'),
			imax = styles.length,
			i = 0,
			x, href;

		for (; i < imax; i++) {
			x = styles[i];
			href = x.getAttribute('href');

			if (!href) 
				continue;
			

			if (href[0] === '/')
				href = href.substring(1);
			

			if (href.indexOf('?') !== -1) 
				href = href.substring(0, href.indexOf('?'));
			

			if (path.toLowerCase().indexOf(href.toLowerCase()) !== -1) {

				reloadTag(x, 'href');

				break;
			}
		}
	}

	function reloadTag(node, srcAttribute) {
		var clone = node.cloneNode(),
			src = node.getAttribute(srcAttribute);

		src += (src.indexOf('?') > -1 ? '&' : '?') + Date.now() + '=true';

		clone.setAttribute(srcAttribute, src);

		node.parentNode.replaceChild(clone, node);
	}
	
	function XHR(resource, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			xhr.readyState === 4 && callback && callback(resource, xhr.responseText);
		};

		xhr.open('GET', typeof resource === 'object' ? resource.url : resource, true);
		xhr.send();
	}

}(typeof window === 'undefined' ? global : window));

// end:source ../src/20.Autoreload.js