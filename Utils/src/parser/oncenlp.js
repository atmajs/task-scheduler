(function(){
	
	// in 200ms
	// in 1 hour and 30 mins
	
	include.exports = function(str, dtstart){
		
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
	
	var parsers = [
		[ /\s*in/, in_parser]
	]
}());