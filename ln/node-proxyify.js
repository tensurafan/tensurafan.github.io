module.exports = (function(window, document, volFolder, terms){

	Array.prototype.forEach.call(document.querySelectorAll("body > div"), div=>!div.querySelector("img") && div.classList.add("trash"))

	Array.prototype.forEach.call(document.querySelectorAll("sup"), sup=>{
		let target = document.getElementById(sup.querySelector("a").hash.replace("#", ""))

		let footNote = target.nextElementSibling.textContent

		let iconDiv = document.createElement("span")
		iconDiv.classList.add("icon", "color-primary", "color-in")

		iconDiv
			.appendChild(document.createElement("span"))
			.classList.add("footnote", "clickable")

		iconDiv.setAttribute("data-hover-text", footNote)

		iconDiv.setAttribute("onclick", `this.app.showFootnote(this, this.getAttribute('data-hover-text'), event)`)

		sup.parentNode.replaceChild(iconDiv, sup)
	})

	let classesToRemove = []
	for(var i = 0; i < 100; i++){
		classesToRemove.push(`c${i}`)
	}

	Array.prototype.forEach.call(document.querySelectorAll("p, a, span, div, h1, h2, h3, h4, h5, h6, h7, h8, hr"), textNode=>{
		var paraStyles = window.getComputedStyle(textNode)
		if (paraStyles.textAlign === "center"){
			textNode.classList.add("text-center")
		}

		if (parseInt(paraStyles.fontWeight) > 400 ){
			textNode.classList.add("strong")
		}

		if (paraStyles.textDecoration.indexOf("line-through") > -1){
			textNode.classList.add("strikethrough")
		}

		if (paraStyles.fontStyle === "italic"){
			textNode.classList.add("italic")
		}

		if (paraStyles.textIndent !== "0px"){
			textNode.classList.add("indent")
		}

		classesToRemove.forEach(classToDrop=>textNode.classList.remove(classToDrop))
	})

	Array.prototype.forEach.call(document.querySelectorAll("img"), img=>{
		let relSrc = img.getAttribute("src")

		//~ let absoluteSrc = img.src.replace(document.location.origin, "")
		img.setAttribute("src", volFolder + relSrc)
		//~ let natHeight = img.naturalHeight
		//~ let natWidth = img.naturalWidth
		//~ img.setAttribute("height", natHeight)
		//~ img.setAttribute("width", natWidth)
	})

	/*Array.prototype.forEach.call(document.querySelectorAll("p"), paragraph=>{
		if (!paragraph.textContent.trim() && !paragraph.id && !paragraph.querySelector("[id]") && !paragraph.querySelector("img")){
			paragraph.parentNode.removeChild(paragraph)
		}
	})*/

	Array.prototype.forEach.call(document.querySelectorAll("[style]"), el=>el.removeAttribute("style"))

	Array.prototype.filter.call(document.querySelectorAll("p"), p=>p.querySelector("img"))
		.forEach(p=>{
			p.parentNode.replaceChild(p.querySelector("img"), p)
		})

	Array.prototype.forEach.call(document.querySelectorAll(".trash, script"), trash=>trash.parentNode.removeChild(trash))

	Array.prototype.forEach.call(document.querySelectorAll("body > *"), (line, index)=>{
		line.classList.add("line")
		let originalId = line.id
		line.id = "line_" + index

		if (originalId){
			let targetingLink = document.querySelector(`[href*="${originalId}"]`)
			if(targetingLink){
				targetingLink.setAttribute("href", "#" + line.id)
			}
		}

	})

	// remove the class attribute from anything that doesn't have a class
	Array.prototype.forEach.call(document.querySelectorAll("[class]"), el=>!el.getAttribute("class") && el.removeAttribute("class"))

	let termsRegex = new RegExp("(\\W\|\^)" + terms.pattern + "(s\$|s\\W|\\W\|\$)", "gi")

	let uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	function capitalCase(phrase){
		return phrase.toLowerCase().split(" ").map(word=>word[0].toUpperCase() + word.slice(1)).join(" ")
	}

	function setupChooseable(text){
		return text.replace(termsRegex, function(
			matchedTerm,
			beforeTargetedPhraseCharacter,
			afterTargetedPhraseCharacter,
			matchedLocation
		){
			let targetedPhrase = matchedTerm.slice(beforeTargetedPhraseCharacter.length, matchedTerm.length - afterTargetedPhraseCharacter.length)

			let displayedTermValue = "this.app.allTermsChosen[this.parentNode.dataset.term]"
			if (uppercaseLetters.includes(targetedPhrase[0])){
				if (terms.terms[targetedPhrase.toLowerCase()]){
					displayedTermValue = "this.app.capitalCase(this.app.allTermsChosen[this.parentNode.dataset.term.toLowerCase()])"
				}
				else if (terms.terms[capitalCase(targetedPhrase)]){
					displayedTermValue = "this.app.capitalCase(this.app.allTermsChosen[this.app.capitalCase(this.parentNode.dataset.term)])"
				}
			}

			let watchTarget = "allTermsChosen[this.parentNode.dataset.term]"

			if (!terms.terms[targetedPhrase]){
				if (terms.terms[targetedPhrase.toLowerCase()]){
					watchTarget = "allTermsChosen[this.parentNode.dataset.term.toLowerCase()]"
				}
				else if (terms.terms[capitalCase(targetedPhrase)]){
					watchTarget = "allTermsChosen[this.app.capitalCase(this.parentNode.dataset.term)]"
				}
			}

			return `${beforeTargetedPhraseCharacter}<span data-term="${targetedPhrase}" class="underline clickable selectable-term" onclick="this.app.selectNameEventHandler(event)">{:${displayedTermValue}:}|{${watchTarget}}|</span>${afterTargetedPhraseCharacter}`
		})
	}

	let spans = Array.prototype.filter.call(document.querySelectorAll("span"), span=>!span.querySelector("*"))

	spans.forEach(span=>{
		span.innerHTML = setupChooseable(span.innerHTML)
	})

	return document.body.innerHTML

	function sleep(ms){
		return new Promise(accept=>setTimeout(accept, ms))
	}
})
