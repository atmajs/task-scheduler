include.exports = Class('Application', {
	Base: Class.Serializable,
	
	_id: null,
	
	
	name: '',
	
	// working directory
	base: '',
	
	// md5 password
	password: '',
	
	Validate: {
		name (val) {
			if (!val) 
				return 'Application name is empty';
		},
		base (val) {
			if (!val) 
				return 'Application working directory is empty';
		}
	}
})