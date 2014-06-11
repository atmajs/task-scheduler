(function(){
	
	// in 200ms
	// in 1 hour and 30 mins
	
	include.exports = {
		once: function(str, dtstart){
			
			_str = str;
			_date = dtstart == null
				? new Date
				: new Date(dtstart)
				;
			
			var i = -1,
				imax = parsers.length;
			while ( ++i < imax ){
				if (parsers[i][0].test(str)) {
					parsers[i][1]();
					break;
				}
			}
			return _date;
		},
		interval: function(str){
			_str = str;
			return interval_parser();
		}
	};
	
	var _date, _str;
	
	var in_parser;
	(function(){
		in_parser = function (){
			var imax = timespans.length,
				i = -1;
			while ( ++i < imax ){
				_str = _str.replace(timespans[i][0], timespans[i][1]);
			}
		};
		
		var timespans = [
			[ /(\d+)\s*(ms)\b/i, wrap(milliseconds) ],
			[ /(\d+)\s*(seconds?|s)\b/i, wrap(seconds) ],
			[ /(\d+)\s*(minutes?|min)\b/i, wrap(minutes) ],
			[ /(\d+)\s*(hours?|h)\b/i, wrap(hours) ],
			[ /(\d+)\s*(days?|d)\b/i, wrap(days) ],
			[ /(\d+)\s*(weeks?|w)\b/i, wrap(weeks) ],
			[ /(\d+)\s*(months?|M|m)\b/i, wrap(months) ],
		];
		function wrap(fn){
			return function(full, val){
				fn(val << 0);
				return '';
			};
		}
		function milliseconds(val) {
			_date.setMilliseconds(_date.getMilliseconds() + val);
		}
		function seconds(val) {
			_date.setSeconds(_date.getSeconds() + val);
		}
		function minutes(val) {
			_date.setMinutes(_date.getMinutes() + val);
		}
		function hours(val) {
			_date.setHours(_date.getHours() + val);
		}
		function days(val) {
			_date.setDate(_date.getDate() + val);
		}
		function weeks(val){
			days(val * 7);
		}
		function months(val){
			_date.setMonth(_date.getMonth() + val);
		}
	}());
	
	var interval_parser;
	(function(){
		var _interval;
		interval_parser = function(){
			_interval = 0;
			
			var imax = timespans.length,
				i = -1;
			while ( ++i < imax ){
				_str = _str.replace(timespans[i][0], timespans[i][1]);
			}
			return _interval;
		};
		
		var timespans = [
			[ /(\d+)\s*(ms)\b/i, wrap(milliseconds) ],
			[ /(\d+)\s*(seconds?|s)\b/i, wrap(seconds) ],
			[ /(\d+)\s*(minutes?|min)\b/i, wrap(minutes) ],
			[ /(\d+)\s*(hours?|h)\b/i, wrap(hours) ],
			[ /(\d+)\s*(days?|d)\b/i, wrap(days) ],
			[ /(\d+)\s*(weeks?|w)\b/i, wrap(weeks) ],
		];
		function wrap(fn){
			return function(full, val){
				fn(val << 0);
				return '';
			};
		}
		function milliseconds(val) {
			_interval += val;
		}
		function seconds(val) {
			_interval += val * 1000;
		}
		function minutes(val) {
			_interval += val * 60 * 1000;
		}
		function hours(val) {
			_interval += val * 60 * 60 * 1000;
		}
		function days(val) {
			_interval += val * 24 * 60 * 60 * 1000;
		}
		function weeks(val){
			_interval += val * 7 * 24 * 60 * 60 * 1000;
		}
	}());
	
	var parsers = [
		[ /\s*in/, in_parser]
	]
}());