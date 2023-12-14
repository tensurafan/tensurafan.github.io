const fs = require("fs")
const volumes = require(__dirname + "/ln/volumes.json")
const terms = require(__dirname + "/ln/terms.json")
const jsdom = require("jsdom")
const path = require("path")
const waitFor = (fn, ...args)=>new Promise((accept, reject)=>fn.apply(this, [...args, (uwu, owo)=>uwu ? reject(uwu) : accept(owo)]))
const uglify = require("uglify-js")
const proxyify = require("./ln/node-proxyify.js")
// const JSDOM = jsdom.JSDOM
const http = require("http")
const handler = require("serve-handler")
const open = require("open")
const fx = require('mkdir-recursive')
const port = Math.floor(Math.random() * 9000 + 1000)

;(async function(){

	/*
	for(let volume of volumes){
		let location = "http://localhost:" + port + volume.raw + "?cache-bust=" + Date.now()
		console.log("opening", location)
		await open(location)
		let acc = null, rej = null
		parsingVol = new Promise((accept, reject)=>{
			acc = accept
			rej = reject
		})
		parsingVol.accept = acc
		parsingVol.reject = rej
		parsingVol.url = volume.raw
		await parsingVol

		console.log("parsed", location)
	}
	*/

	let parseAllPromise = volumes.map(async volume=>{
		if (volume.progress < 100 || !volume.raw){
			return console.log("skipping", volume.name)
		}
		console.log("parsing", volume.name)
		let folder = volume.raw.replace(/\/[^\/]+\.html?$/, "\/")
		let volumeHtml = await waitFor(fs.readFile, __dirname + volume.raw, "utf-8")
		let volumeDoc = new jsdom.JSDOM(volumeHtml)
		let window = volumeDoc.window
		let document = window.document
		console.log("proxyifying", volume.name)

		await waitFor(fs.writeFile, __dirname + volume.path, proxyify(window, document, folder, terms))

		console.log("done:", volume.name)
	})

	await Promise.all(parseAllPromise)

	return console.log("parse over")

	let page404 = await waitFor(fs.readFile, __dirname + "/404.html", "utf-8")
	let doc404 = new jsdom.JSDOM(page404)
	let redirectScript = doc404.window.document.head.querySelector("script").innerHTML
	let scriptBody = uglify.minify(redirectScript)
	let redirectTag = `<script>${scriptBody.code}</script>`

	console.log("created redirect script")

	let waiting = volumes.map(async volume=>{

		let readerPath1 = `${__dirname}/read/${volume.id}/index.html`
		let readerPath2 = `${__dirname}/read/${volume.id}.html`

		let readerPage = genPage(`Slime Reader ${volume.name}`, "", redirectTag)

		await smartWrite(readerPath1, readerPage)
		await smartWrite(readerPath2, readerPage)
	})

	console.log("/read/* files created")

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
	</html>`.replace(/(\t|\r\n|\n)/g, "")
}

async function smartWrite(location, data){
	try{
		fs.writeFileSync(location, data)
	}
	catch(uwu){
		let folder = path.dirname(location)
		console.log("making folder", folder)
		fx.mkdirSync(folder)
		fs.writeFileSync(location, data)
	}
}
