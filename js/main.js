async function app(initConfigs){
	if (
		!initConfigs.volumeList ||
		!initConfigs.presist
	){
		return
	}


	// respoond to the incoming global configs
	initConfigs.presist.theme = Object.prototype.hasOwnProperty.call(initConfigs.presist, "theme") ? initConfigs.presist.theme : "dark"
	proxymity.watch(initConfigs.presist, "theme", updateTheme)
	updateTheme(initConfigs.presist.theme)

	function updateTheme(newTheme){
		console.log(newTheme)
		if (newTheme && !document.documentElement.classList.contains(newTheme)){
			document.documentElement.classList.remove("oled", "dark")
			document.documentElement.classList.add(newTheme)
		}
		else if (!newTheme){
			document.documentElement.classList.remove("oled", "dark")
		}

		app.updateSettings(initConfigs.presist)
	}


	// setup the different views
	let router = app.router = app.routerFactory(document.getElementById("app"))

	let navEl = document.getElementById("nav")
	let nav = app.nav = await app.initNav(initConfigs.presist, router)
	nav.appendTo(navEl)

	let indexView = app.indexView = await app.initIndexView(initConfigs.volumeList, router)

	let reader = app.reader = await app.initReader(initConfigs.volumeList, router)

	// set up the router and stuff
	window.addEventListener("popstate", ev=>{
		app.router.rout()
	})

	function updateNavHeight(){
		document.body.style.setProperty("--menu-height", navEl.offsetHeight + "px")
	}
	window.addEventListener("resize", updateNavHeight)
	proxymity.watch(nav.app, "menuOpen", updateNavHeight)
	updateNavHeight()

	app.router.rout()

	console.log(initConfigs)
}

// Init ========================================================

// app.init() is called in the index.html file
app.init = doAsync("start", function(dontInstaStart){
	let initObject = {}

	// while we're doing nothing and waiting for fetching might as well load the configs
	fetch("/ln/volumes.json")
		.then(owo=>owo.json())
		.then(owo=>(initObject.volumeList = owo) && this.jumpto("app")(initObject))
		.catch(uwu=>this.jumpto("error")(uwu))

	this.jumpto("getReadingState")(initObject)

})
.then("getReadingState", function(initObject){
	// Object.assign(initObject, app.getSettings())
	initObject.presist = app.getSettings()
	this.pass(initObject)
})
.then("app", app)
.then("error", function(uwu){
	console.warn(uwu)
	alert("failed to load volumes data")
})
