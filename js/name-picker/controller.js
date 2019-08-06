app.initNamePicker = async function(routerInstance, appBody, nameChoices){
	let template = await fetch("/js/name-picker/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		baseName: "",
		chosenName: "",
		nameOptions: [],
		display: false,
		nameChoices: nameChoices,
		saveSettings: app.saveSettings
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
