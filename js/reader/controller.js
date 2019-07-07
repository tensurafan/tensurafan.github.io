app.initReader = async function(volumes, routerInstance, namePickerInstance, terms, globalTermchoices, presistantConfigs, quoterInstance){
	let template = await fetch("/js/reader/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		errored: false,
		errorMessage: "",
		showFootnote,
		allTermsChosen: globalTermchoices,
		selectNameEventHandler,
		mounted: false,
		rout: routerInstance.rout,
		volume: "",
		title: "",
		description: "",
		beginLongPress: function(ele, ev){
			ele.longPressWait = setTimeout(()=>{
				let line = ele.id.replace("line_", "")
				quoterInstance.app.url = `${document.location.origin}/read/${view.app.volume.id}/quote/${line}/`
				quoterInstance.app.element = ele
				document.removeEventListener("scroll", cancleWhenScroll)
			}, 800)
			
			document.addEventListener("scroll", cancleWhenScroll, {once: true})
			
			
			function cancleWhenScroll(ev){
				view.app.cancleLongPress(ele, ev)
			}
		},
		cancleLongPress: function(ele, ev){
			ele.longPressWait && clearTimeout(ele.longPressWait)
		},
	})

	let readerContainer = view.find(el=>el.id === "reading-content")

	routerInstance.add("/read/*", view)

	let subableEvents = ["scroll", "touchend", "touchcancle", "mouseup", "blur"]

	routerInstance.on.set(view, async function(){
		let pathMatch = /^\/read\/([^\/]+)\/?(quote\/([^\/]+))?/.exec(routerInstance.path)

		let volumeId = view.app.volumeId = pathMatch[1]
		let quotedLine = parseInt(pathMatch[3])

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

				let containerWidth = readerContainer.offsetWidth

				readeingcontent.forEach(el=>{
					if (el instanceof HTMLImageElement){
						let originalWidth = parseInt(el.getAttribute("width"))
						if (originalWidth < containerWidth){
							return
						}
						let originalHeight = parseInt(el.getAttribute("height"))

						let shrinkRatio = containerWidth / originalWidth

						el.setAttribute("width", (originalWidth * shrinkRatio) + "px")
						el.setAttribute("height", (originalHeight * shrinkRatio) + "px")

						el.style.minWidth = el.getAttribute("width")
						el.style.minHeight = el.getAttribute("height")
						el.addEventListener("load", ()=>{
							el.style.minWidth = "0"
							el.style.minHeight = "0"
						})
					}
				})

				readeingcontent.appendTo(readerContainer)

				app.title.app.viewDescription = ""
				app.title.app.viewTitle = `Slime Reader ${volume.name}`
				if (quotedLine){
					let quotedParagraph = document.getElementById("line_" + quotedLine)
					quotedParagraph.classList.add("color-primary", "color-in")
					quotedParagraph.scrollIntoView({
						// behavior: "smooth",
						block: "center"
					})

					app.title.app.viewTitle = `Slime Reader ${volume.name} Line ${quotedLine}`
					app.title.app.viewDescription = quotedParagraph.textContent
				}
				else if (presistantConfigs.topLine && presistantConfigs.topLine[volumeId]){
					let line = document.getElementById("line_" + presistantConfigs.topLine[volumeId])
					line.scrollIntoView({block: "start"})
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
	})

	// --- alright here's the foot note stuff

	// ok we need to set up some stuff to do with the term selector
	let termsToCheck = Object.keys(terms)

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

		namePickerInstance.app.baseName = ele.dataset.term
		namePickerInstance.app.chosenName = globalTermchoices[ele.dataset.term]
		namePickerInstance.app.setNameOptions(terms[ele.dataset.term])
		namePickerInstance.app.display = true
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

	function RAFP(){
		return new Promise(function(accept){
			requestAnimationFrame(accept)
		})
	}
}
