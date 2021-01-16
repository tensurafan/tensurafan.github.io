module.exports = (function(window, document, volFolder, terms){

	Array.prototype.forEach.call(document.querySelectorAll("body > div"), div=>!div.querySelector("img") && div.classList.add("trash"))

	Array.prototype.forEach.call(document.querySelectorAll("sup"), sup=>{
		let target = document.getElementById(sup.querySelector("a").hash.replace("#", ""))
		let targetParent = target.parentNode
		targetParent.childNodes.forEach(node=>{
			if (node.tagName.toLowerCase() == "a"){
				targetParent.removeChild(node)
			}
		})

		let footNote = targetParent.textContent

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

	let termsRegex = new RegExp("(\\b)" + terms.pattern + "(\\b)", "gi")

	let uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	function capitalCase(phrase){
		return phrase.toLowerCase().split(" ").map(word=>word[0].toUpperCase() + word.slice(1)).join(" ")
	}

	function setupChooseable(text){
		return text.replace(termsRegex, function(
			targetedPhrase,
		){

			let targetedPhraseUpperCase = capitalCase(targetedPhrase)

			let targetedPhraseLowerCase = targetedPhrase.toLowerCase()

			let trueTargetedPhrase = targetedPhraseLowerCase

			let targetTerm = terms.terms[trueTargetedPhrase = targetedPhrase] || terms.terms[trueTargetedPhrase = targetedPhraseLowerCase] || terms.terms[trueTargetedPhrase = targetedPhraseUpperCase]

			let targetedPhraseChunks = targetedPhrase.split(" ")

			let targetedPhraseIsSingularWord = targetedPhraseChunks.length === 1

			let originalIsUpperCase = uppercaseLetters.includes(targetedPhrase[0])

			let originalChunksAllHaveUpperCaseStart = targetedPhraseChunks.reduce((assumptionSoFar, newWordChunk)=>assumptionSoFar && uppercaseLetters.includes(newWordChunk[0]), true)

			if (!targetTerm){
				console.log(targetedPhrase, "not found in terms set")
				return targetedPhrase
			}
			if (trueTargetedPhrase !== targetedPhrase && targetTerm.caseSensitive){
				//~ console.log("rejected", targetedPhrase)
				return targetedPhrase
			}

			let displayedTermValue = "this.app.allTermsChosen[this.parentNode.dataset.term]"
			if (trueTargetedPhrase !== targetedPhrase && originalIsUpperCase){
				displayedTermValue = `this.app.capitalCase(this.app.allTermsChosen[this.parentNode.dataset.term], ${originalChunksAllHaveUpperCaseStart})`
			}
			else if (trueTargetedPhrase !== targetedPhrase){
				displayedTermValue = "this.app.allTermsChosen[this.parentNode.dataset.term].toLowerCase()"
			}

			return `<span data-term="${trueTargetedPhrase || targetedPhrase}" class="underline clickable selectable-term" onclick="this.app.selectNameEventHandler(event)">{:${displayedTermValue}:}|{allTermsChosen[this.parentNode.dataset.term]}|</span>`
		})
	}

	let spans = Array.prototype.filter.call(document.querySelectorAll("span"), span=>!span.querySelector("*"))

	spans.forEach(span=>{
		span.innerHTML = setupChooseable(span.innerHTML)
		span.childNodes.forEach(node=>{
			if (typeof (node.classList) === "undefined" && node.textContent.trim()){
				let replacemnt = document.createElement("span")
				replacemnt.textContent = node.textContent
				node.replaceWith(replacemnt)
			}
		})
	})

	return document.body.innerHTML

	function sleep(ms){
		return new Promise(accept=>setTimeout(accept, ms))
	}
})
