app.initNav = async function (currentConfigs, routerInstance) {
	let template = await fetch("/js/nav/view.html").then(owo => owo.text())

	let version = await fetch("/build.txt").then(owo => owo.text())

	version = version.split(" ")[0]

	let view = proxymity(template, {
		version,
		configs: currentConfigs,
		menuOpen: false,
		back: () => {
			routerInstance.path !== "/" && routerInstance.back()
		},
		useableFonts: [],
		backClickable: false,
		goHome: () => routerInstance.rout("/"),
		refreshCache: () => fetch('/sw/refresh').then(owo => owo.text()).then(() => document.location.reload()),
	})

	routerInstance.on.rout(path => {
		if (path === "/") {
			view.app.backClickable = false
		}
		else {
			view.app.backClickable = true
		}
	})
		; (async () => {
			const fontToCheck = new Set([
				// Default
				'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
				// Memes
				'tenslafont005',
				// Linux
				'Bitstream Charter', 'Bitstream Vera Serif', 'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'FreeMono', 'FreeSans', 'FreeSerif', 'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Nimbus Mono L', 'Nimbus Roman No9 L', 'Nimbus Sans L', 'Standard Symbols L', 'URW Bookman L', 'URW Chancery L', 'URW Gothic L', 'URW Palladio L', 'WenQuanYi Micro Hei', 'WenQuanYi Zen Hei', 'American Typewriter', 'Andale Mono', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Copperplate', 'Courier', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Gill Sans', 'Helvetica Neue',
				// Windows 10
				'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
				// macOS
				'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
			].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));  // sort alphabetically

			await document.fonts.ready;

			const avalableFonts = new Set();

			for (const font of fontToCheck.values()) {
				if (document.fonts.check(`12px "${font}"`)) {
					avalableFonts.add(font);
				}
			}

			view.app.useableFonts = [...avalableFonts.values()]
		})()

	return view
}
