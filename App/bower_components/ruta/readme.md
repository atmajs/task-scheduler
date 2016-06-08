RutaJS
----

[![Build Status](https://travis-ci.org/atmajs/Ruta.png?branch=master)](https://travis-ci.org/atmajs/Ruta)
[![NPM version](https://badge.fury.io/js/ruta.svg)](http://badge.fury.io/js/ruta)
[![Bower version](https://badge.fury.io/bo/ruta.svg)](http://badge.fury.io/bo/ruta)


*Route*_Key_-Value Collection for Browser and Node.js


Mainly used for an application routing, but can be used for any other purpose

##### Route

- strict match **part(s)**
	- ``` /user ``` _(same as ``` !/user ```)_ does not match ``` /user/bob ``
- begins with **part(s)**
	- ``` ^/user ``` matches ``` /user/bob ```, but does not ``` /users ```
- regexp - enclosed in parentheses '(regexp)'
	- ``` (\.less$) ```
	- ``` /user/:action(edit|delete) ```
	- ``` /user/:action([a-z]{2,4}) ```
- method
	- ```$post /user```
- query string _(matches key/value at any position(order) in query string)_
	- ```?debug```
	- ```?debug=js```
	- ```?debug=(js|less)``` (in parenthese **regexp** is used, note here is also full-match is used
	- ```?:debugger(d|debug)=(js|less)``` match `d=less` like `debugger: 'less'`

##### Parts

>Each route definition (path) is split into parts _(folders)_.

Each part _(folder)_ can be

- strict (_default behaviour_) ``` /user/:name ``` - all are strict
- optional: ``` /user/?:name ``` - _user_ is strict, but next folder with alias _name_ is optional.
- alias, _seen from example above_: ``` /user/:name ```
- alias with regexp: ``` /user/:name(\w{3,8}) ```
- alias with possible values ```/:action(create|edit|remove) ```


### Collection

Route-Value Collection.

```javascript
/**
 * @param route <String> : route definition
 * @param obj <Any> : value to store in collection
 */
ruta.Collection.prototype.add(route, obj <Any>);


/**
 * @param path <String>: url string
 * @param method <String>: optional, request method GET, POST, DELETE, PUT
 * @return route <Object> {
 *      value <Any> - stored value,
 *      current <Object> {
 *          params <Object>, - holds alias values and querystring arguments
 *          url <String>
 *      }
 * }
 */
ruta.Collection.prototype.get(path, ?method);
    
```

```javascript
var collection = new ruta.Collection();

collection
    .add('/user/:id', {foo: 'bar'});

var route = collection.get('/user/20');

route.value === { foo: 'bar' };
route.current.params.id === 20;
```

### Router

If collection is bound to a router, then each item value in the collection should be a function, which
will be called, when router emits the URL-change event.

RutaJS supports History API and ```hashchanged``` routing.


**Important** _ruta_ object is already the route collection itself. And there is History API Router bound to this collection.



#### Examples

```javascript

var collection = new ruta.Collection();

collection.add('/user/:id', myObject);
collection.get('/user/10') // -> { key: '/user/:id', value: myObject, current: { id: 10 } } 

// Will match '/foo', '/foo/bar', ...
collection.add('^/foo', x);

// Strict Pattern, match '/foo'
collection.add('/foo')
collection.add('/foo?query=string')


// Conditional
collection.add('/user/?:id')


// Query String
collection.add('/users', X);
collection.get('/users?loc=DE') 
//> { key: '/users', value: X, current: { params: { loc: 'DE' }, url: '/users?loc=DE' } }

```


----
_Atma.js Project_
