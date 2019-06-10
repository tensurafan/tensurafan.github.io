app.initNav = async function(routerInstance){
	let template = await fetch("/js/nav/view.html").then(owo=>owo.text())

	let view = proxymity(template)

	return view
}
