app.routerFactory = function(element){
	var onSetCallbacks = new Map()
	var onUnsetCallbacks = new Map()
	var routs = new Map()
	return {
		add: function(keyObj, view){
			// add a rout that will activate when those keys in keyobj is found in the query parameter
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
		clear: function(){
			// clear all keys on the ULR that this router has registered
		},
		on: {
			set: function(view, callback){

			},
			unset: function(view, callback){

			}
		}
	}
}
