app.initTitle = async function(routerInstance){
	let template = await fetch("/js/title/view.html").then(owo=>owo.text())
	let view = proxymity(template, {
		viewTitle: "",
		viewDescription: ""
	})

	routerInstance.on.rout(function(path, routedView){
		if (routedView.app.title){
			view.app.viewTitle = routedView.app.title
		}
		else{
			view.app.viewTitle = "Slime Reader"
		}
		if (routedView.app.description){
			view.app.viewDescription = routedView.app.description
		}
		else{
			view.app.viewDescription = "Read Tensurafan translation group's english translation of the light novel series 《That time I got reincarnated as a slime》"
		}
	})

	return view
}
