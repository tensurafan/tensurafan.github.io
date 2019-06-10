app.routerFactory = function(element){
	const onSetCallbacks = new Map()
	const onUnsetCallbacks = new Map()
	const routs = new Map()
	let active = null

	return {
		add: function(path, view){
			// add a rout that will activate when those keys in keyobj is found in the query parameter
			let pathRegex = new RegExp("^" + path + "$")
			routs.set(pathRegex, {path, view})
		},
		set: function(view){
			// rout the view and set the url to that view's keys
			for(let rout in routs){
				let pathView = rout[1]

				if (pathView.view === view){
					return setView(pathView.path, view)
				}
			}
			console.warn(view, "is not defined yet")
		},
		rout: function(path = undefined){
			// rout the app based on the current ULR or set the current url to path and rout
			let passive = false
			if (!path){
				path = document.location.pathname
				passive = true
			}

			for(let rout in routs){
				let regex = rout[0]
				let pathView = rout[1]

				if (regex.test(path)){
					return setView(path, pathView.view, !passive)
				}
			}
		},
		on: {
			set: function(view, callback){

			},
			unset: function(view, callback){

			}
		}
	}

	function setView(path, view, addHistory = true){
		addHistory && history.pushState({}, "", path)
		active && active.detach()
		view.appendTo(element)
	}
}
