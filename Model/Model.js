var type = include.route.params && include.route.params.type || 'server';
include
	.setBase(include.location)
	.js(
		'../Utils/Utils.js::Utils',
		'src/entity/**.es6.package::Entity',
		'src/' + type + '/**.es6.package::Model'
	)
	.done(function(resp){
		
		include.exports = resp.Model
	});