include
	.js(
		'CronTrigger.es6'
		, 'OnceTrigger.es6'
		, 'RRuleTrigger.es6'
		, 'IntervalTrigger.es6'
	)
	.done(function(resp){
		
		include.exports = function(rule){
			
			for (var key in resp){
				if (resp[key].canHandle(rule)) {
					return new resp[key]({ rule: rule });
				}
			}
			logger.error('Rule is not supported', rule);
			return null;
		}
	})