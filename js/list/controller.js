app.initIndexView = async function(volumes, routerInstance){
	var template = await fetch("/js/list/view.html").then(owo=>owo.text())

	let view = proxymity(template, {volumes})

	routerInstance.add("/", view)

	return view
}
