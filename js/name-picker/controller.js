app.initNamePicker = async function(routerInstance, appBody, nameChoices){
	let template = await fetch("/js/name-picker/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		baseName: "",
		chosenName: "",
		nameOptions: [],
		display: false,
		setNameOptions: async function(newOptions){
			view.app.nameOptions.splice(0, view.app.nameOptions.length)
			let savedChosenName = view.app.chosenName
			view.app.chosenName = ""
			await proxymity.on.renderend
			view.app.nameOptions.push.apply(view.app.nameOptions, newOptions)
			!view.app.chosenName && (view.app.chosenName = savedChosenName)
		},
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
