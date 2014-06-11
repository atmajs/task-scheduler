include.exports = Class('Application', {
	Base: Class.Serializable,
	
	_id: null,
	
	
	name: '',
	
	// working directory
	base: '',
	
	// md5 password
	password: '',
})