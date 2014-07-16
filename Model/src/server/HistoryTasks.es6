include.exports = Class.Collection(Class.Model.HistoryTask, {
	Store: Class.MongoStore.Collection('task-history')
})