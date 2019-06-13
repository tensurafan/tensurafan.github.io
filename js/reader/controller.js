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

			while(readerContainer.lastChild){
				readerContainer.removeChild(readerContainer.lastChild)
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
			let div = document.createElement("div")
			let img = document.createElement("img")
			img.src = paragraphData.img
			div.appendChild(img)
			div.classList.add("text-center")
			return div
		}
		else{
			let p = document.createElement("p")
			paragraphData.classes.forEach(c=>p.classList.add(c))

			paragraphData.sections.forEach(part=>{
				if (part.text){
					let textElement = document.createTextNode(part.text)
					if (part.url){
						textElement = document.createElement("a")
						textElement.href = part.url
						textElement.target = "_blank"
						textElement.textContent = part.text
					}

					p.appendChild(textElement)
				}
				else if (part.info){
					let iconDiv = document.createElement("div")
					iconDiv.classList.add("icon")

					iconDiv
						.appendChild(document.createElement("div"))
						.classList.add("footnote")

					iconDiv.addEventListener(
						"click",
						showFootnote.bind(iconDiv, iconDiv, part.info)
					)

					p.appendChild(iconDiv)
				}
			})
			return p
		}
	}

	function showFootnote(element, footnote){

	}
}
