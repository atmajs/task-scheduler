include.exports = {
	format: function(Commands, command, args){
		
		if (has([ command ])) {
			_str = '';
			help_generic(Commands);
			return _str;
		}
		
		if (has(args)) {
			_str = '';
			help_command(Commands, command);
			return _str;
		}
		
		return null;
	}
}

function help_generic(Commands) {
	write('bg_green<bold<Task Scheduler>> usage:');
        
    newLine();
    write('$ taskd [command] [arguments ...]'.cyan, 1);
    
    newLine();
    write('Commands:'.bold, 1);
    
    Object.keys(Commands).forEach(function(action){
         write(action, 2);
    });
    
    newLine();
    
    write('To get more help for each action enter:', 1)
    write('$ atma [command] --help'.cyan, 2);
    
    newLine();
    
    write('In case of any issue, please contact green<bold<team@atmajs.com>>');
    write('You can also attach a log output:');
    write('$ atma [arguments] --level 99 --no-color > output.log'.cyan, 1);
    
    newLine();
    write('Happy Coding.')
}
function help_command(Commands, command) {
	var endpoints = Commands[command]
	
    if (endpoints == null) {
        write(logger.formatMessage(
			'Command not found: red<`%s`>'.red
			, command
			,'\n$ taskd --help'.bold
		));
        return;
    }
    
	var keys = Object.keys(endpoints);
	
    write(logger.formatMessage(
		' Command: bold<bg_cyan< %s >> with cyan<%s> action(s):'.color.white
		, command
		, keys.length
	));
    
	keys.forEach(endpoint => {
		var x = endpoints[endpoint].meta;
		var name = endpoint.bold,
			args = ' ';
		
		for( var key in x.arguments) {
			args += ' -' + key.bold + ' ' + String(x.arguments[key]).yellow;
		}
		
		write('');
		write(name + args, 1);
		
		if (x.description) {
			write(x.description, 2);
		}
	});
	
}

var _str = '';
function has(arr){
	return arr.some(x => /^[-\\\/]+(h|help|\?)\s*$/.test(x));
}
function write(message, indent) {
    if (indent == null)
        indent = 0;
        
    indent += 1;
    
    var pref = '';
    
    while (--indent > -1) 
        pref += '   ';

    _str += '\n' + pref + message.color.white;
}
function newLine() {
    write('');
}