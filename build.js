const fs = require("fs")
const volumes = require(__dirname + "/ln/volumes.json")
const jsdom = require("jsdom")
const path = require("path")
const waitFor = (fn, ...args)=>new Promise((accept, reject)=>fn.apply(this, [...args, (uwu, owo)=>uwu ? reject(uwu) : accept(owo)]))
const uglify = require("uglify-js")
// const JSDOM = jsdom.JSDOM
const http = require("http")
const handler = require("serve-handler")
const open = require("open")
const fx = require('mkdir-recursive')
const port = Math.floor(Math.random() * 9000 + 1000)


// console.log(Object.getOwnPropertyNames(Array.prototype))

;(async function(){
	let parsingVol = null
	let tempServer = http.createServer((req, res)=>{
		if (req.method === "POST" && req.url === "/save"){
			let targetedVol = volumes.find(vol=>vol.raw === req.headers.raw)
			let writer = fs.createWriteStream(__dirname + targetedVol.path)
			req.on("data", chunk=>writer.write(chunk))
			req.on("end", ()=>writer.end() + parsingVol.accept())
		}
		else{
			handler(req, res, {
				trailingSlash: true,
				cleanUrls: false,
			}, {
				readFile: function(path, config){
					if (/\.html$/.test(path)){
						return new promise(function(accept, reject){
							fs.readFile(path, config, function(err, data){
								if (err){
									return reject(err)
								}

								if (typeof data === "string"){
									data = data.replace("</body>", `<script src="../proxyify.js"></script></body>`)
									accept(data)
								}
								else{
									data = data.toString()
									data = data.replace("</body>", `<script src="../proxyify.js"></script></body>`)
									data = Buffer.from(data)
									accept(data, "utf8")
								}
							})
						})
					}
					return new promise(function(accept, reject){
						fs.readFile(path, config, function(err, data){
							if (err){
								return reject(err)
							}
							return accept(data)
						})
					})
				}
			})
		}
	})

	tempServer.listen(port)

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

	await new Promise(accept=>tempServer.close(()=>console.log("temp server closed")+accept()))

	console.log("parse over")

	let page404 = await waitFor(fs.readFile, __dirname + "/404.html", "utf-8")
	let doc404 = new jsdom.JSDOM(page404)
	let redirectScript = doc404.window.document.head.querySelector("script").innerHTML
	let scriptBody = uglify.minify(redirectScript)
	let redirectTag = `<script>${scriptBody.code}</script>`

	console.log("created redirect script")

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
		}).reduce((sum, set)=>sum.concat(set), []))

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
