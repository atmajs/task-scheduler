include
	.use('Model.Tasks', 'Logger')
	.done(function(resp, Tasks, log){
		
		/* Events:
		 * - `time`, task
		 * - `watch`, task, timerID
		 */
		var _emitter = new Class.EventEmitter,
			_collection = new Tasks,
			_timers = {}
			;
		
		include.exports = Class({
			
			Static: {
				collection: _collection,
				
				watchRange: function(endTime, startTime = new Date){
					var current = new Date;
					if (startTime < current) 
						startTime = current;
					
					if (endTime < startTime) 
						endTime = startTime;
					
					
					return _add_range(startTime, endTime);
				},
				
				watch: function(task){
					return _tryAdd(task);
				},
				unwatch: function(task){
					task = _collection.findSame(task);
					_timer_clear(task);
					_collection.remove(task);
				},
				
				on: _emitter.on.bind(_emitter),
				off: _emitter.off.bind(_emitter)
			}
		});
		
		
		function _add_range(startTime, endTime){
			var dfr = new Class.Deferred;
			
			Tasks
				.fetch({
					next: {
						$and: [
							{ $gte: startTime },
							{ $lte:   endTime }
						]
					}
				})
				.fail(dfr.rejectDelegate())
				.done(add)
			
			function add(tasks){
				
				var added = tasks
					.toArray()
					.map(x => _tryAdd(x))
					;
					
				dfr.resolve(added);
			}
			
			return dfr;
		}
		
		
		function _tryAdd(task){
			if (_collection.contains(task)) 
				return false;
			
			if (_watch(task) === false) 
				return false;
			
			_collection.push(task);
			return true;
		}
		
		
		function _watch(task) {
			if (task.trigger.hasNext() === false) 
				return false;
			
			var date = task.trigger.getNext(),
				span = date - new Date,
				timer = setTimeout(_fireDelegate(task), span)
				;
			log('TaskFactory | Watch `%s` in `%d`ms'
				, task.name
				, span
			);
			
			_timer_add(timer, task);
			_emitter.trigger('watch', task, timer);
			return true;
		}
		
		function _fireDelegate(task) {
			return function(){
				_timer_remove(task);
				
				_emitter.trigger('time', task);
				
				if (_collection.indexOf(task) === -1) 
					return;
				
				if (_watch(task) === false) 
					_collection.remove(task);
			};
		}
		
		function _timer_remove(task) {
			delete _timers[task._id.toString()];
		}
		function _timer_clear(task) {
			var key = task._id.toString(),
				data = _timers[key];
			if (data == null) 
				return;
			
			clearTimeout(data.timer);
			delete _timers[key];
		}
		function _timer_add(timer, task) {
			_timers[task._id.toString()] = {
				timer: timer,
				task: task
			};
		}
	})
