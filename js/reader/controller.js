app.initReader = async function(volumes, routerInstance){
	let template = await fetch("/js/reader/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		errored: false,
		errorMessage: "",
	})

	routerInstance.add("/read/*", view)

	routerInstance.on.set(view, async function(){
		let pathMatch = /^\/read\/([^\/]+)(\/quote\/([^\/]+))?$/.exec(routerInstance.path)

		let volumeId = pathMatch[1]
		let quotedLine = pathMatch[3]

		let volume = volumes.find(volume=>volume.id === volumeId)
		if (!volume){
			view.app.errored = true
			view.app.errorMessage = "The volume you have requested doesn't exist UwU"
			return
		}

		try{
			let content = await fetch(volume.path).then(owo=>owo.json())
			view.app.errored = false
			view.app.errorMessage = ""
			let readerContainer = view.find(el=>el.id === "reading-content")
			
			while(readerContainer.firstChild){
				readerContainer.removeChild(readerContainer.firstChild)
			}

			content.map(generateParagraph)
				.forEach(paragraph=>paragraph && readerContainer.appendChild(paragraph))
		}
		catch(uwu){
			view.app.errored = true
			view.app.errorMessage = "Oops something went wrong UwU"
			console.warn(uwu)
		}
	})

	return template

	function generateParagraph(paragraphData){
		if (paragraphData.img){
			let img = document.createElement("img")
			img.src = paragraphData.img
			return img
		}
		console.log(paragraphData)
		
	}
}
