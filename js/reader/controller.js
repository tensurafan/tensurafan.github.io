app.initReader = async function(routerInstance){
	let template = await fetch("/js/reader/view.html").then(owo=>owo.text())

	let view = proxymity(template)

	routerInstance.add("/read/*", view)

	return template
}
