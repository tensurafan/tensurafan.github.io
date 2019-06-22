app.initFooter = async function(configs){
	let template = await fetch("/js/install-instructions/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		config: configs,
		showInstructions: false,
		saveSettings: app.saveSettings,
	})

	let instructionsTemplate = await fetch("/js/install-instructions/instructions.html").then(owo=>owo.text())

	let instructionsView = proxymity(instructionsTemplate, view.app)

	instructionsView.appendTo(document.body)

	return view
}
