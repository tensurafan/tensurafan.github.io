app.initReader = async function(volumes, routerInstance){
	let template = await fetch("/js/reader/view.html").then(owo=>owo.text())

	let view = proxymity(template)

	routerInstance.add("/read/*", view)

	routerInstance.on.set(view, async function(){
		let pathMatch = /^\/read\/([^\/]+)(\/quote\/([^\/]+))?$/.exec(routerInstance.path)

		let volumeId = pathMatch[1]
		let quotedLine = pathMatch[3]

		let volume = volumes.find(volume=>volume.id === volumeId)
		if (!volume){
			view.app.error = true
			view.app.errorMessage = "The volume you have requested doesn't exist UwU"
			return
		}

		try{
			await fetch(volume.path).then(owo=>owo.text())
			view.app.error = false
			view.app.errorMessage = ""
		}
		catch(uwu){
			view.app.error = true
			view.app.errorMessage = "Oops something went wrong UwU"
			console.warn(uwu)
		}
	})

	return template
}
