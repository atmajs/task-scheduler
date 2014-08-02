include
	.js(
		'./Server.es6',
		'./TaskFactory.es6',
		'./TaskQueue.es6',
		'./model/*.es6.package::Package'
	)
	.done(resp => include.exports = resp.Package);