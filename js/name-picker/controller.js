app.initNamePicker = async function(routerInstance, appBody, nameChoices){
	let template = await fetch("/js/name-picker/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		baseName: "",
		chosenName: "",
		nameOptions: [],
		display: false,
		nameChoices: nameChoices,
		saveSettings: app.saveSettings,
		setChoice: function({options, baseName, chosenName}){

			view.app.nameOptions = options
			view.app.baseName = baseName
			view.app.display = true
			proxymity.on.renderend.then(owo=>{
				view.app.chosenName = chosenName
			})
		},
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
