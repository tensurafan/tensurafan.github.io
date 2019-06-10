app.initIndexView = async function(volumes, routerInstance){
	try{
		var template = await fetch("js/list/view.html").then(owo=>owo.text())
	}
	catch(uwu){
		this.jumpto("error")(uwu)
	}

	let view = proxymity(template, {volumes})

	routerInstance.add("/", view)

	return view
}
