app.routerFactory = function(element){
	const onSetCallbacks = new Map()
	const onUnsetCallbacks = new Map()
	const routs = new Map()
	return {
		add: function(path, view){
			// add a rout that will activate when those keys in keyobj is found in the query parameter
			let pathRegex = new RegExp("^" + path + "$")
			routs.set(pathRegex, view)
		},
		set: function(view){
			// rout the view and set the url to that view's keys
		},
		unset: function(view) {
			// check if the view is in the app and unset it and unset the keys that that view has registered,
		},
		rout: function(){
			// rout the app based on the current ULR
		},
		on: {
			set: function(view, callback){

			},
			unset: function(view, callback){

			}
		}
	}
}
