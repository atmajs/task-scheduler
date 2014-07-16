include
	.setBase(include.location)
	.js(
		'node_modules/cron-parser/dist/cron-parser.js::CronParser'
		, 'node_modules/rrule/lib/rrule.js::RRule'
		, 'src/.package::Helpers'
	)
	.done(function(resp){
		
		var _CronParser = resp.CronParser || CronParser,
			_RRule = resp.RRule || RRule;
		
		include.exports = {
			Parser: {
				CronExpression: _CronParser.parseExpression,
				RRule: _RRule,
				OnceExpression: resp.Helpers.parser.trigger.once,
				IntervalExpression: resp.Helpers.parser.trigger.interval
			},
			
			obj: resp.Helpers.obj,
			is: resp.Helpers.is,
			
			execScript: resp.Helpers.script.execute
		};
	});
