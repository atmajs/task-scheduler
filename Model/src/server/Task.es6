include.exports = Class.patch('Task', {
	Extends: Class.MongoStore.Single({
		collection: 'tasks',
		indexes: [
			{ 'name': 1 },
			{ 'app._id': 1 }
		]
	})
});
