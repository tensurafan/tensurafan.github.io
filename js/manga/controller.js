app.initMangaList = async function(routerInstance, chapters){
	var template = await fetch("/js/manga/view.html").then(owo=>owo.text())

	let view = proxymity(template, {chapters})

	routerInstance.add("/manga", view)

	return view
}
