app.initTitle = async function(routerInstance){
	let template = document.querySelectorAll(".title-controllable")

	let viewTitle = template[0].textContent
	template[0].textContent = "{:this.app.viewTitle:}|{viewTitle}|"

	let viewDescription = template[1].getAttribute("content")
	template[1].setAttribute("content", "{:this.app.viewDescription:}|{viewDescription}|")

	let view = proxymity(template, {
		viewTitle,
		viewDescription,
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
