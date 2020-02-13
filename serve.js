var express = require('express')
var serveStatic = require('serve-static')

var app = express()

app.use(serveStatic(__dirname))

app.get("/*", (req, res)=>{
	res.sendFile(__dirname + "/index.html")
})

app.listen(3000)
