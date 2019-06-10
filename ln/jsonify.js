var lines = []
Array.prototype.forEach.call(document.body.children, ele=>{
	var image
	if (!ele.textContent.trim()){
		if (!(image = ele.querySelector("img"))){
			return
		}
	}

	var paragraph = {}
	if (image){
		paragraph.img = image.src.replace(document.location.origin, "")
	}
	else if (ele instanceof HTMLDivElement){
		return
	}
	else{
		paragraph.sections = []
		paragraph.classes = []

		var paraStyles = window.getComputedStyle(ele)
		if (paraStyles.textAlign === "center"){
			paragraph.classes.push("text-center")
		}

		Array.prototype.forEach.call(ele.children, textContainer=>{
			var containerStyles = window.getComputedStyle(textContainer)

			if (textContainer instanceof HTMLSpanElement){
				var part = {
					text: textContainer.textContent,
					bold: parseInt(containerStyles.fontWeight) > 400 ? true : false
				}

				var link
				if (link = textContainer.querySelector("a")){
					part.url = link.href
				}
			}
			else if (textContainer instanceof HTMLAnchorElement){
				if (!textContainer.href){
					return
				}
				// console.log(textContainer)
			}
			else{
				// is a sup
				var targetLink = textContainer.querySelector("a")
				if (!targetLink){
					console.log(textContainer)
				}
				var targetId = targetLink.hash.replace("#", "")
				var linkedTo = document.getElementById(targetId)

				// console.log(targetId, linkedTo, textContainer)
				var part = {
					info: linkedTo.nextElementSibling.textContent
				}
			}

			paragraph.sections.push(part)
		})
	}

	lines.push(paragraph)
})
