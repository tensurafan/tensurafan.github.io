async function app(initConfigs){
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

	let namePicker = app.namePicker = await app.initNamePicker(router, document.getElementById("app"))

	let reader = app.reader = await app.initReader(initConfigs.volumeList, router, namePicker)

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
app.init = async function(){
	let volumeList = await fetch("/ln/volumes.json").then(owo=>owo.json())
	let presist = app.getSettings()

	return app({volumeList, presist})
}
