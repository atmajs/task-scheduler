mask.registerHandler(':app', Compo({
	//compos: {
	//
	//},
	//events: {
	//
	//},
	slots: {
		createTask () {
			this.find(':task-editor').showDialog();
		}
	},
	//pipes: {
	//
	//},
	//constructor: function(){
	//
	//},

	onRenderStart: function(model, ctx, container){
		// ..
	},
	onRenderEnd: function(elements, model, ctx, container){
		// ..
	},

	//dispose: function(){
	//
	//}
}));
