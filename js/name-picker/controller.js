app.initNamePicker = async function(routerInstance, appBody){
	let template = await fetch("/js/name-picker/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		baseName: "",
		chosenName: "",
		nameOptions: [],
		display: false,
		setNameOptions: async function(newOptions){
			view.app.nameOptions.splice(0, view.app.nameOptions.length - 1 )
			await proxymity.on.renderend
			view.app.nameOptions.push.apply(view.app.nameOptions, newOptions)
		}
	})

	proxymity.watch(view.app, "display", function(shouldDisplay){
		if (!shouldDisplay){
			return view.detach()
		}

		if (shouldDisplay){
			view.appendTo(appBody)
		}
	})

	routerInstance.on.rout(function(){
		view.app.appendTo = null
	})

	return view
}
