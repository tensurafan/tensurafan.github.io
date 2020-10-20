var express = require('express')
var serveStatic = require('serve-static')

var app = express()

app.use(serveStatic(__dirname))

app.get("/*", (req, res)=>{
	res.sendFile(__dirname + "/index.html")
})

app.get("*", (req, res)=>{
	res.status(404).sendFile(__dirname + "/404.html")
})

app.listen(9001)

console.log("App server started at http://localhost:9001")
