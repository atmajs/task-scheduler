#### IncludeJS

_The Resource Loader for Browsers and NodeJS_

[![Build Status](https://travis-ci.org/atmajs/IncludeJS.svg?branch=master)](https://travis-ci.org/atmajs/IncludeJS)

Features:

- Loads any content: scripts, styles, ajax
- Development friendly: incremental builds are not required
- Production: finally, build the application into single html, js and css @see the [Atma.Toolkit](https://github.com/atmajs/Atma.Toolkit)
- Inline Dependency Declaration
	
	_No external files, such as package.json or config.js_
	
- Load any javascript
- No prerequests for module declaration. But supports also `CommonJS` and `include.exports`

- Namespaced routing
	```javascript
	include
		.routes({ controller: '/src/controllers/{0}.js' }); 
		//... 
	include
		.js({controller: 'user' });
	```
- Parameterized include
	```javascript
	// foo.js
	include.js({ compo: 'baz?color=green' });
	
	// baz.js
	document.body.style.backgroundColor = include.iparams.color
	```
	
- Javascript Aliases
	```javascript
	include.js('myScript.js::Logger').done(function(response){
		response.Logger.logMe();
	});	
	```
	
- Custom Loader Support

- Lazy Modules

	_Scripts will be evaluated only when you needs them_
	

- Pause resource loading

	```javascript
	// pause current module
	var resume = include.pause();
	
	someAsyncJob(function(){
		// resume with exports example
		resume({ baz: 'quux' });
	})
	```

----
(c) 2014 Atma.js Project


