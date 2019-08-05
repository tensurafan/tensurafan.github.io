let fs = require("fs")
module.exports = async function(document){
	await RAFP()
	await RAFP()
	await RAFP()

	await RAFP()

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

	Array.prototype.forEach.call(document.querySelectorAll("p, a, span, div, h1, h2, h3, h4, h5, h6, h7, h8"), textNode=>{
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

		classesToRemove.forEach(classToDrop=>textNode.classList.remove(classToDrop))
	})

	Array.prototype.forEach.call(document.querySelectorAll("img"), img=>{
		let absoluteSrc = img.src.replace(document.location.origin, "")
		img.setAttribute("src", absoluteSrc)
		let natHeight = img.naturalHeight
		let natWidth = img.naturalWidth
		img.setAttribute("height", natHeight)
		img.setAttribute("width", natWidth)
	})

	Array.prototype.forEach.call(document.querySelectorAll("p"), paragraph=>{
		if (!paragraph.textContent.trim() && !paragraph.id && !paragraph.querySelector("[id]") && !paragraph.querySelector("img")){
			paragraph.parentNode.removeChild(paragraph)
		}
	})

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

		let beginLongPressCode = "this.app.beginLongPress(this, event)"
		let cancleLongPressCode = "this.app.cancleLongPress(this, event)"

		line.setAttribute("onmousedown", beginLongPressCode)
		line.setAttribute("ontouchstart", beginLongPressCode)

		line.setAttribute("ontouchend", cancleLongPressCode)
		line.setAttribute("ontouchcancle", cancleLongPressCode)
		line.setAttribute("onmouseup", cancleLongPressCode)
		line.setAttribute("onmouseleave", cancleLongPressCode)
		line.setAttribute("onmouseout", cancleLongPressCode)

	})

	Array.prototype.forEach.call(document.querySelectorAll("[class]"), el=>!el.getAttribute("class") && el.removeAttribute("class"))

	let terms = await fs.promises.readFile("./terms.json", "utf-8").then(owo=>JSON.parse(owo))
	await RAFP()
	await RAFP()

	// let ln = document.body.innerHTML

	let spans = Array.prototype.filter.call(document.querySelectorAll("span"), span=>!span.querySelector("*"))

	Object.keys(terms).forEach(termToCheck=>{
		let termRegex = new RegExp("(\\W\|\^)" + termToCheck + "(\\W\|\$)", "g")

		spans.forEach(span=>{
			let text = span.innerHTML
			span.innerHTML = span.innerHTML.replace(termRegex, function(matched, before, after){
				return before + `<span data-term="${termToCheck}" class="underline clickable" onclick="this.app.selectNameEventHandler(event)">{:this.app.allTermsChosen[this.parentNode.dataset.term]:}|{allTermsChosen[this.parentNode.dataset.term]}|</span>` + after

				return termToCheck
			})
		})
	})

	return document.body.innerHTML

	function sleep(ms){
		return new Promise(accept=>setTimeout(accept, ms))
	}

	function RAFP(){
		return new Promise(accept=>setTimeout(accept, 0))
	}
}
