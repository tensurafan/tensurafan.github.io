const fs = require("fs")
const volumes = require(__dirname + "/ln/volumes.json")
const jsdom = require("jsdom")
const path = require("path")
const waitFor = (fn, ...args)=>new Promise((accept, reject)=>fn.apply(this, [...args, (uwu, owo)=>uwu ? reject(uwu) : accept(owo)]))
// const JSDOM = jsdom.JSDOM

;(async function(){
	let page404 = await waitFor(fs.readFile, __dirname + "/404.html", "utf-8")
	let doc404 = new jsdom.JSDOM(page404)
	let redirectTag = doc404.window.document.head.innerHTML

	let waiting = volumes.map(async volume=>{
		let text = await waitFor(fs.readFile, __dirname + volume.path, "utf-8")
		let doc = new jsdom.JSDOM(text)

		let document = doc.window.document
		await Promise.all(Array.prototype.map.call(document.querySelectorAll("body .line"), ele=>{
			let lineNumber = ele.id.replace("line_", "")
			let quotePath1 = `${__dirname}/read/${volume.id}/quote/${lineNumber}/index.html`
			let quotePath2 = `${__dirname}/read/${volume.id}/quote/${lineNumber}.html`

			let quotedPage = genPage(`Slime Reader ${volume.name}: Line ${lineNumber}`, ele.textContent, redirectTag)

			return [
				smartWrite(quotePath1, quotedPage),
				smartWrite(quotePath2, quotedPage)
			]
		}).flat())

		let readerPath1 = `${__dirname}/read/${volume.id}/index.html`
		let readerPath2 = `${__dirname}/read/${volume.id}.html`

		let readerPage = genPage(`Slime Reader ${volume.name}`, "", redirectTag)

		await smartWrite(readerPath1, readerPage)
		await smartWrite(readerPath2, readerPage)
	})

})()

function genPage(title, description, redirectTag){
	return `<html>
		<head>
			<title class="controllable">${title}</title>
			<meta class="controllable" property="og:type" content="object" />
			<meta class="controllable" name="description" content="${description}"/>
			<meta class="controllable" property="og:title" content="${title}" />
			<meta class="controllable" property="og:description" content="${description}" />
			<meta class="controllable" property="og:locale" content="en_US" />

			<meta class="controllable" name="twitter:card" content="summary" />
			<meta class="controllable" name="twitter:title" content="${title}" />
			<meta class="controllable" name="twitter:description" content="${description}" />

			${redirectTag}
		</head>
		<body></body>
	</html>`
}

async function smartWrite(location, data){
	try{
		await waitFor(fs.writeFile, location, data)
	}
	catch(uwu){
		let folder = path.dirname(location)
		console.log("making folder", folder)
		await waitFor(fs.mkdir, folder, { recursive: true })
		await waitFor(fs.writeFile, location, data)
	}
}
