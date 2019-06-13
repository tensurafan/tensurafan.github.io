app.routerFactory = function(element){
	const onSetCallbacks = new Map()
	const onUnsetCallbacks = new Map()
	const routs = new Map()
	const onRoutCallbacks = []
	let active = null

	let instance = {
		add: function(path, view){
			// add a rout that will activate when those keys in keyobj is found in the query parameter
			path = path
				.replace(/\*$/, ".+")
				.replace(/\*/, "[^\/]+")

			let pathRegex = new RegExp("^" + path + "$")
			routs.set(pathRegex, {path, view})
		},
		rout: function(path = undefined){
			// rout the app based on the current ULR or set the current url to path and rout
			let passive = false
			if (!path){
				path = document.location.pathname
				passive = true
			}

			for(let rout of routs){
				let regex = rout[0]
				let pathView = rout[1]

				if (regex.test(path)){
					return setView(path, pathView.view, !passive)
				}
			}

			console.warn(path, "does not match any routs")
		},
		back: function(){
			history.back()
		},
		on: {
			set: function(view, callback){
				onSetCallbacks.set(view, callback)
			},
			unset: function(view, callback){
				onUnsetCallbacks.set(view, callback)
			},
			rout: function(callback){
				onRoutCallbacks.push(callback)
			}
		}
	}

	Object.defineProperty(instance, "path", {
		get: ()=>document.location.pathname
	})

	return instance

	function setView(path, view, addHistory = true){
		addHistory && history.pushState({}, "", path)
		if (active !== view){
			active && active.detach()
			let onUnsetCallback = onUnsetCallbacks.get(active)
			onUnsetCallback && onUnsetCallback()
			active = view
			view.appendTo(element)
		}
		let onSetCallback = onSetCallbacks.get(view)
		onSetCallback && onSetCallback()
		onRoutCallbacks.forEach(callback=>callback(path, view))
	}
}
