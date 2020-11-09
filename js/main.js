async function app(initConfigs){
	// uwu test

	// respoond to the incoming global configs
	app.saveSettings = function(){
		app.updateSettings(initConfigs.presist)
	}

	initConfigs.presist.theme = Object.prototype.hasOwnProperty.call(initConfigs.presist, "theme") ? initConfigs.presist.theme : "dark"
	proxymity.watch(initConfigs.presist, "theme", updateTheme)
	updateTheme(initConfigs.presist.theme)

	function updateTheme(newTheme){
		if (newTheme && !document.documentElement.classList.contains(newTheme)){
			document.documentElement.classList.remove("oled", "dark")
			document.documentElement.classList.add(newTheme)
		}
		else if (!newTheme){
			document.documentElement.classList.remove("oled", "dark")
		}

		app.saveSettings()
	}

	// setup the different views
	let router = app.router = app.routerFactory(document.getElementById("app"))

	let navEl = document.getElementById("nav")
	let appEl = document.getElementById("app")

	let nav = app.nav = await app.initNav(initConfigs.presist, router)
	nav.appendTo(navEl)

	let indexView = app.indexView = await app.initIndexView(initConfigs.volumeList, router)

	let globalTermchoices = initConfigs.presist.chosenTerms = initConfigs.presist.chosenTerms || {}

	let searcher = app.searcher = await app.initTextSearcher(router, appEl)

	let namePicker = app.namePicker = await app.initNamePicker(router, appEl, globalTermchoices)

	Object.keys(initConfigs.terms).forEach(term=>globalTermchoices[term] = globalTermchoices[term] || term)

	let termsChooser = app.termsChooser = await app.initChooseablesView(globalTermchoices, initConfigs.terms, router)

	let reader = app.reader = await app.initReader(initConfigs.volumeList, router, namePicker, initConfigs.terms, globalTermchoices, initConfigs.presist)

	let footer = app.footer = await app.initFooter(initConfigs.presist)
	footer.appendTo(document.getElementById("footer"))

	let title = app.title = await app.initTitle(router)
	title.appendTo(document.head)

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

}

// Init ========================================================

// app.init() is called in the index.html file
app.init = async function(){
	let [volumeList, terms] = await Promise.all([
		fetch("/ln/volumes.json").then(owo=>owo.json()),
		fetch("/ln/terms.json").then(owo=>owo.json())
	])

	let presist = app.getSettings()

	return app({volumeList, terms: terms.terms, presist})
}
