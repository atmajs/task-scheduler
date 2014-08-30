### Localization Module (_NodeJS and Browser_)
----
[![Build Status](https://travis-ci.org/atmajs/i18n.svg?branch=master)](https://travis-ci.org/atmajs/i18n)
[![NPM version](https://badge.fury.io/js/atma-i18n.svg)](http://badge.fury.io/js/atma-i18n)

- [MaskJS](https://github.com/atmajs/MaskJS) Localization Util
- Localization Function

#### Node.js
_Resolve language from the current request(middleware)_

#### Browser
_Resolve language from ```navigator.language``` or ```location.query ('/?language=en') ```_

>  If the language is not supported, the default one is taken.

#### Formatter
[Atma-Formatter](https://github.com/atmajs/util-format) is used to format/interpolate strings.

#### Pluralization
Refer to the `atma-formatter`.

#### Usage

##### Mask Util

```~[L: ID [,...expressions]]```
```~[L: (expression) [,...expressions]]```

- Simple:  ```~[L:fooId]```
- Formatting:
	
	_Example:_
	```scss
		header > '~[L:welcomeId, name]'
		// same as
		header > '~[L:"welcomeId", name]'
	```
	```javascript
	$L.extend('en', {
		welcome: 'Hello {0}!'
	});
	mask.render(template, { name: 'Baz' });
	```
	
- get i18n ID from model:
	_Example:_
	```scss
		var menu = [ 'todo', 'task' ]
		ul {
			for (item of menu) {
				li > '~[L:("m_" + item)]'
			}
		}
	```
	```javascript
	$L.extend('en', {
		m_todo: 'My Todos',
		m_task: 'My Tasks'
	});
	mask.render(template);
	```


##### Function

**Browser** @see [examples](examples)
```javascript
	$L('titleHello');
```

**Node**
```javascript
	connect
		.use($L.middleware({
			support: [ 'en', 'de', 'ru' ],
			path: '/public/localization/%%.json'
		});
	// Aftewards each `req` has `$L` function.
	// Or use direct
	$L.fromReq(req)('id');
```

### Configuration

##### IncludeJS

###### Browser
Load this library with IncludeJS - after defining the list of supported languages and the path to translations,
it will load also supported translations

```javascript
include
	.embed('/atma/localization.js?path=/public/i18n/%%.json&langs=de,it,fr')
	.done(function(){
		// appropriate translationis is loaded and ready to use
		$L('welcome', 'Baz')
	});
	
```

###### NodeJS
Use the `middleware` function so that not all translations are loaded at once, but only with the first incomming request.


----
(c) MIT, Atma.js Project