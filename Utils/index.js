(function(){
	
	include
		.setBase(include.location)
		.js(
			'node_modules/cron-parser/lib/parser.js::CronExpression'
			, 'node_modules/rrule/lib/rrule.js::RRule'
			, 'src/.package::Helpers'
			//, './node_modules/underscore/underscore-min.js::_'
		)
		.done(function(resp){
			
			include.exports = {
				CronExpression: resp.CronExpression,
				RRule: resp.RRule.RRule,
				Parser: {
					OnceExpression: resp.Helpers.parser.trigger.once,
					IntervalExpression: resp.Helpers.parser.trigger.interval
				},
				
				obj: resp.Helpers.obj,
				is: resp.Helpers.is,
				
				execScript: resp.Helpers.script.execute
			};
		});
}());