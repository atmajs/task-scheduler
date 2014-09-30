### Component: Tabs
[![Build Status](https://travis-ci.org/atmajs/compo-tabs.png?branch=master)](https://travis-ci.org/atmajs/compo-tabs)
[![Bower version](https://badge.fury.io/bo/compo-tabs.svg)](http://badge.fury.io/bo/compo-tabs)

```scss
a:tabs
	x-visible = 'foo' // optional, name of the current visible tab 
	x-route = '/baz'  // optional, listens hashchange or history API changes 
	x-anchors = true  // all panels are visible and it behaves like a scrollspy
	
	{ /*Template*/ }
```

- Best works with [RutaJS](https://github.com/atmajs/ruta) and [Mask.Animation](https://github.com/atmajs/mask-animation)
- Renders the Bootstraps HTML and the class structure.
_Tired always to write extra html code?[Boostrap Tabs](http://getbootstrap.com/javascript/#tabs-usage)_

##### Templates
- Headers And Panels

	```scss
	a:tabs x-visibile = baz {
		@tab name = foo {
			@head > 'FooHeader'
			@body > 'FooContent' 
		}
		@tab name = baz {
			@head > 'BazHeader'
			@body > 'BazContent' 
		}
	}
	```
	
- Panels only

	```scss
	a:tabs {
		@panel name=foo >
			span.foo > 'Foo'
		
		@panel name=baz >
			span.baz > 'Baz'
	}
	```
	
- Animations

	```scss
	a:tabs {
		// Tabs Template
		// ...
		
		// Animations
		@show {
			@model > 'transform | scale(0) translate3d(100%, 100%, 0) > scale(1) translate3d(0, 0, 0) | 2s linear'
		}
		@hide {
			@model > 'transform | scale(1) > scale(0)| 2s linear'
		}
	}
	```
	
#### API

- **`setActive = function(String)`** <a name='setActive'>#</a>
	
	Show the tab by name.
	
- **`getActiveName = function(): String`** <a name='getActiveName'>#</a>
	
	Get current active name.

- **`getList = function(): [String]`** <a name='getList'>#</a>

	Get all names.
	
- **`has = function(String): Boolean`** <a name='has'>#</a>

	Check if the component contains the tab name.


###### Api Example
_template_
```scss
	section >
		a:tabs #tabs-example {
			@tab name = foo {
				@head > 'FooHeader'
				@body > 'FooContent' 
			}
			@tab name = baz {
				@head > 'BazHeader'
				@body > 'BazContent' 
			}
		}
```
_javascript_
```javascript
var App = Compo({ template: template })
var app = mask.Compo.initialize(App);
var tab = app.find('#tabs-example');

tab.getList() //> foo, baz
tab.getActiveName() //> foo
tab.setActive('baz');
```

### Examples

- [/examples](/examples)

```bash
# install atma toolkit
npm install atma
# run server
atma server

# navigate `http://localhost:5777/examples/simple.html`
```

### Test
```bash
npm test
```

:copyright: MIT - Atma.js Project