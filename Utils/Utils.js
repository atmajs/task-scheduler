include
	.setBase(include.location)
	.js(
		'node_modules/cron-parser/dist/cron-parser.js::CronParser'
		, 'node_modules/rrule/lib/rrule.js::RRule'
		, 'src/.package::Helpers'
	)
	.done(function(resp){
		
		var _CronParser = resp.CronParser || CronParser,
			_RRule = resp.RRule || RRule,
			_Helpers = resp.Helpers
			;
		
		include.exports = {
			Parser: {
				CronExpression: _CronParser.parseExpression,
				RRule: _RRule,
				OnceExpression: _Helpers.parser.trigger.once,
				IntervalExpression: _Helpers.parser.trigger.interval
			},
			
			obj: _Helpers.obj,
			is: _Helpers.is,
			date: _Helpers.date,
			execScript: _Helpers.script.execute
		};
	});
