function app(initConfigs){
	if (
		!initConfigs.volumeList ||
		!initConfigs.id
	){
		return
	}

	console.log(initConfigs)
}

// Init ========================================================

app.init = doAsync("start", async function(dontInstaStar){
	try{
		let initObject = {}
		this.jumpto("getReadingState")(initObject)

		initObject.volumeList = await fetch("ln/volumes.json").then(owo=>owo.json())

		this.jumpto("app")(initObject)
	}
	catch(uwu){
		this.jumpto("error")(uwu)
	}
})
.then("getReadingState", function(initObject){
	Object.assign(initObject, app.getSettings())
	this.pass(initObject)
})
.then("app", app)
.then("error", function(uwu){
	console.warn(uwu)
	alert("failed to load volumes data")
})
