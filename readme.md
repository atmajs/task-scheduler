Task Scheduler
----
[![Build Status](https://travis-ci.org/atmajs/task-scheduler.svg?branch=master)](https://travis-ci.org/atmajs/task-scheduler)

**_Work in progress_**


Task Scheduler Server to schedule or run scripts/applications/commands which:
- scales. Server consists of a master task queue process and the workers. 
- has web interface
- has RESTful API
- has websockets
- has database persistance


#### Time Triggers
Describe with:
- [RRule](https://github.com/jakubroztocil/rrule)
- [Cron](https://github.com/tenbits/cron-parser)
- One time triggers:
	- `Date` instance
	- relative to the current time, like `in 2 hours and 20 minutes`
	
#### Executors
- source: `{ src: 'tasks/foo.js' }`
- command: `{ command: 'wget -i file' }`
- request: `{ url: 'http://foo.com/baz', method: 'POST', data: {}}`

### CLI
```bash
$ npm i -g task-scheduler
$ tasksched --help

# Server
$ tasksched server --help
# - start the server
$ tasksched server start
# - stop the server
$ tasksched server stop

# Application
$ tasksched app --help
# - create the application. Tasks are bound to the app after the authorization
$ tasksched app create --name Foo --password BazPass
# ... for more infos, see the help action

# Task
$ tasksched task --help
# - create the task
$ tasksched task create --name FooName --trigger "in 20 minutes" --exec.src baz.js
# ... for more infos, see the help action
```

### Web Interface
Start the server `$ tasksched server start` and navigate to `http://localhost:5888/`

### Client module
```javascript
	var client = require('task-scheduler-client');
	client
		.ensureTask({
			name: 'sync data',
			trigger: 'FREQ=DAILY;BYHOUR=23',
			exec: {
				src: '/tasks/sync-data.js'
			}
		})
		.done(onSuccess) //> created
		.fail(onError)   //> task creation failed
		;
```
> If the task with the same name, same `trigger` and `exec` already exists, it will do nothing.

----
(c) MIT - The Atma.js Project