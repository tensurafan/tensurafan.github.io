app.initIndexView = async function(volumes, routerInstance){
	var template = await fetch("/js/list/view.html").then(owo=>owo.text())

	let view = proxymity(template, {volumes})

	view.app.read = function(id){
		routerInstance.rout("/read/" + id)
	}

	view.app.routSelectables = function(){
		routerInstance.rout("/chooseables")
	}

	routerInstance.add("/", view)

	return view
}
