Task Scheduler
----
**_work in progress_**


Task Scheduler Server to schedule or run scripts/applications/commands which:
- scales: Server consists of a master Task Queue process and the workers. 
- has web interface
- has RESTful API
- has WebSockets


#### Time Triggers
Describe with:
- [RRule](https://github.com/jakubroztocil/rrule)
- [Cron](https://github.com/tenbits/cron-parser)
- One time triggers:
	- `Date`
	- Relative to current date, like `in 2 hours and 20 minutes`
	
#### Executors
- Source: `{ src: 'tasks/foo.js' }`
- Command: `{ command: 'wget -i file' }`


_There are already some tests in project directories_

It is simple as just ensuring that a task exists
```javascript
	var client = require('task-scheduler-client');
	client.ensureTask({
		name: 'sync data',
		trigger: 'FREQ=DAILY;BYHOUR=23',
		exec: {
			src: '/tasks/sync-data.js'
		}
	});
```

----
(c) MIT - The Atma.js Project