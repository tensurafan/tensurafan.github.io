async function app(initConfigs) {
	// uwu test

	// respoond to the incoming global configs
	app.saveSettings = function () {
		app.updateSettings(initConfigs.presist)
	}

	// code to do with changing and saving of theme
	initConfigs.presist.theme = Object.prototype.hasOwnProperty.call(initConfigs.presist, "theme") ? initConfigs.presist.theme : "dark"
	proxymity.watch(initConfigs.presist, "theme", updateTheme)
	updateTheme(initConfigs.presist.theme)

	function updateTheme(newTheme) {
		if (newTheme && !document.documentElement.classList.contains(newTheme)) {
			document.documentElement.classList.remove("oled", "dark", "sepialight", "sepiadark")
			document.documentElement.classList.add(newTheme)
		}
		else if (!newTheme) {
			document.documentElement.classList.remove("oled", "dark", "sepialight", "sepiadark")
		}

		app.saveSettings()
	}

	function initiateConfigProperty(configuredPropertyName, defaultValue) {
		initConfigs.presist[configuredPropertyName] = Object.prototype.hasOwnProperty.call(initConfigs.presist, configuredPropertyName) ? initConfigs.presist[configuredPropertyName] : defaultValue
		proxymity.watch(initConfigs.presist, configuredPropertyName, app.saveSettings)
	}

	// code to do with hiding and showing of the underline of chooseable terms
	initiateConfigProperty("underlineChooseable", true)
	initiateConfigProperty("coloredIllustrations", true)

	initiateConfigProperty("fontFace", "serif")
	initiateConfigProperty("fontSize", undefined)
	let appRoot = document.getElementById("app")
	proxymity.watch(initConfigs.presist, "fontFace", function (fontFam) {
		if (!fontFam) {
			appRoot.style.removeProperty("font-family")
			return
		}

		appRoot.style.fontFamily = fontFam
	})
	proxymity.watch(initConfigs.presist, "fontSize", function (fontSize) {
		if (!fontSize) {
			appRoot.style.removeProperty("font-size")
			return
		}

		appRoot.style.fontSize = fontSize + "px"
	})

	// setup the different views
	let router = app.router = app.routerFactory(appRoot)

	let navEl = document.getElementById("nav")
	let appEl = document.getElementById("app")

	let nav = app.nav = await app.initNav(initConfigs.presist, router)
	nav.appendTo(navEl)

	let indexView = app.indexView = await app.initIndexView(initConfigs.volumeList, router)

	let globalTermchoices = initConfigs.presist.chosenTerms = initConfigs.presist.chosenTerms || {}

	let searcher = app.searcher = await app.initTextSearcher(router, appEl)

	let managaList = app.mangaList = await app.initMangaList(router, initConfigs.mangaList)

	let namePicker = app.namePicker = await app.initNamePicker(router, appEl, globalTermchoices)

	Object.keys(initConfigs.terms).forEach(term => globalTermchoices[term] = globalTermchoices[term] || term)

	let termsChooser = app.termsChooser = await app.initChooseablesView(globalTermchoices, initConfigs.terms, router)

	let reader = app.reader = await app.initReader(initConfigs.volumeList, router, namePicker, initConfigs.terms, globalTermchoices, initConfigs.presist)

	let footer = app.footer = await app.initFooter(initConfigs.presist)
	footer.appendTo(document.getElementById("footer"))

	let title = app.title = await app.initTitle(router)
	title.appendTo(document.head)

	// set up the router and stuff
	window.addEventListener("popstate", ev => {
		app.router.rout()
	})

	function updateNavHeight() {
		document.body.style.setProperty("--menu-height", navEl.offsetHeight + "px")
	}
	window.addEventListener("resize", updateNavHeight)
	proxymity.watch(nav.app, "menuOpen", updateNavHeight)
	updateNavHeight()

	app.router.rout()

}

// Init ========================================================

// app.init() is called in the index.html file
app.init = async function () {
	let [volumeList, terms, mangaList] = await Promise.all([
		fetch("/ln/volumes.json").then(owo => owo.json()),
		fetch("/ln/terms.json").then(owo => owo.json()),
		fetch("/manga.json").then(owo => owo.json())
	])

	let presist = app.getSettings()

	return app({ volumeList, terms: terms.terms, presist, mangaList })
}
