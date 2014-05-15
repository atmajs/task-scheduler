include
	.use('Model.Tasks')
	.done(function(resp, Tasks){
		
		/* Events:
		 * - `time`, task
		 * - `watch`, task, timerID
		 */
		var _emitter = new Class.EventEmitter,
			_collection = new Tasks
			;
		
		include.exports = Class({
			
			Static: {
				
				watchRange: function(endTime, startTime = new Date){
					var current = new Date;
					if (startTime < current) 
						startTime = current;
					
					if (endTime < startTime) 
						endTime = startTime;
					
					
					return _add_range(startTime, endTime);
				},
				
				watch: function(task){
					return _watch(task);
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
					.map((x) => _tryAdd(x))
					;
					
				dfr.resolve(added);
			}
			
			return dfr;
		}
		
		
		function _tryAdd(task){
			if (_collection.contains(x)) 
				return false;
			
			if (_watch(task) === false) 
				return false;
			
			_collection.push(task);
			return true;
		}
		
		
		function _watch(task) {
			logger.log('Has next', task.trigger.hasNext(), task.trigger._rule);
			if (task.trigger.hasNext() === false) 
				return false;
			
			var date = task.trigger.getNext(),
				span = date - new Date,
				timer = setTimeout(_fireDelegate(task), span)
				;
			logger.log('TaskFactory| Watch `%s` in `%d`ms'
				, task.name
				, span
			);
			
			_emitter.trigger('watch', task, timer);
			return true;
		}
		
		function _fireDelegate(task) {
			return function(){
				
				_emitter.trigger('time', task);
				if (_watch(task) === false) 
					_collection.remove(task);
			};
		}
		
	})
