app.initReader = async function(volumes, routerInstance, namePickerInstance, terms, globalTermchoices, presistantConfigs, quoterInstance){
	let template = await fetch("/js/reader/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		errored: false,
		errorMessage: "",
		showFootnote,
		allTermsChosen: globalTermchoices,
		selectNameEventHandler,
		getSupportingClasses,
		capitalCase,
		mounted: false,
		rout: routerInstance.rout,
		volume: "",
		title: "",
		description: "",
		otherConfigs: presistantConfigs,
	})

	let readerContainer = view.find(el=>el.id === "reading-content")

	routerInstance.add("/read/*", view)

	let subableEvents = ["scroll", "touchend", "touchcancle", "mouseup", "blur"]

	routerInstance.on.set(view, async function(){
		// find which volume we wanna read
		let pathMatch = /^\/read\/([^\/]+)\/?/.exec(routerInstance.path)

		let volumeId = view.app.volumeId = pathMatch[1]

		let volume = volumes.find(volume=>volume.id === volumeId)
		if (!volume){
			view.app.errored = true
			view.app.errorMessage = "The volume you have requested doesn't exist UwU"
			return
		}

		try{
			if (!view.app.mounted && view.app.volume.id !== volume.id){
				view.app.errored = false
				view.app.errorMessage = ""
				let content = await fetch(volume.path).then(owo=>owo.text())

				let readeingcontent = proxymity(content, view.app)

				readeingcontent.appendTo(readerContainer)

				app.title.app.viewDescription = ""
				app.title.app.viewTitle = `Slime Reader ${volume.name}`

				if (presistantConfigs.topLine && presistantConfigs.topLine[volumeId]){
					let line = document.getElementById("line_" + presistantConfigs.topLine[volumeId])
					line && line.scrollIntoView({block: "start"})
				}

				subableEvents.forEach(eventName=>{
					window.addEventListener(eventName, onUserInteractWithPage)
				})
			}
		}
		catch(uwu){
			view.app.errored = true
			view.app.errorMessage = "Oops something went wrong UwU"
			console.warn(uwu)
		}

		view.app.mounted = true
		view.app.volume = volume
	})

	routerInstance.on.unset(view, async function(){
		while(readerContainer.lastChild){
			readerContainer.removeChild(readerContainer.lastChild)
		}
		subableEvents.forEach(eventName=>{
			window.removeEventListener(eventName, onUserInteractWithPage)
		})

		view.app.mounted = false
		view.app.volume = ""
	})

	return template

	function showFootnote(element, footnote, event){
		event.stopPropagation()

		if (element.querySelector(".footnote-visable")){
			return hideFootnote(element)
		}
		let span = document.createElement("span")
		span.textContent = "[" + footnote + "]"
		span.classList.add("footnote-visable")
		element.appendChild(span)
	}

	function hideFootnote(ele){
		let span = ele.querySelector(".footnote-visable")
		span.parentNode.removeChild(span)
	}

	function selectNameEventHandler(ev){
		let ele = ev.target
		let elementModel = ele.app
		if (!elementModel){
			return
		}

		let options = []
		let chosenName
		if (terms[ele.dataset.term]){
			options = terms[ele.dataset.term].options
			chosenName = globalTermchoices[ele.dataset.term]
		}
		else if (terms[ele.dataset.term.toLowerCase()]){
			options = terms[ele.dataset.term.toLowerCase()].options
			chosenName = globalTermchoices[ele.dataset.term.toLowerCase()]
		}
		else if (terms[capitalCase(ele.dataset.term)]){
			options = terms[capitalCase(ele.dataset.term)].options
			chosenName = globalTermchoices[capitalCase(ele.dataset.term)]
		}

		namePickerInstance.app.setChoice({
			options,
			baseName: ele.dataset.term,
			chosenName,
		})
	}

	var navBarEl
	function onUserInteractWithPage(){
		// hideFootnote()
		!navBarEl && (navBarEl = document.getElementById("nav"))
		let navBarBox = navBarEl.getBoundingClientRect()

		let overlappings = document.elementFromPoint(navBarBox.width/2, navBarBox.bottom + 1)

		if (!overlappings){
			return
		}

		presistantConfigs.topLine = presistantConfigs.topLine || {}

		let savedLineNumber = parseInt(overlappings.id.replace("line_", ""))

		if (savedLineNumber){
			presistantConfigs.topLine[view.app.volumeId] = savedLineNumber
			app.saveSettings()
		}
	}

	function capitalCase(phrase, capitalCaseEverything){
		return phrase.toLowerCase().split(" ").map((word, isNotFirst)=>{
			if (capitalCaseEverything){
				return word[0].toUpperCase() + word.slice(1)
			}
			else{
				if (isNotFirst){
					return word
				}
				else{
					return word[0].toUpperCase() + word.slice(1)
				}
			}
		}).join(" ")
	}

	function RAFP(){
		return new Promise(function(accept){
			requestAnimationFrame(accept)
		})
	}

	function getSupportingClasses(element){
		let classList = ""

		if (presistantConfigs.underlineChooseable){
			classList += "underline "
		}

		if (
			element.previousSibling &&
			(
				!element.previousSibling.textContent.trim() ||
				!element.previousSibling instanceof Text
			)
		){
			classList += "follower-selectable-term "
		}

		return classList
	}
}
