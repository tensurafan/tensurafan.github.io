const fs = require("fs")

fs.readFile(__dirname + "/index.html", "utf8", function(uwu, owo){
	if (uwu){
		return console.warn(uwu)
	}
	fs.writeFile(__dirname + "/404.html", owo, function(uwu){
		if (uwu){
			return console.warn(uwu)
		}
	})
})
