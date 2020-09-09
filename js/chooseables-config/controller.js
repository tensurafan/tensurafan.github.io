	app.initChooseablesView = async function(termsChosen, termsOptions, routerInstance){
	var template = await fetch("/js/chooseables-config/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		termsChosen,
		termsOptions,
		termsList: Object.keys(termsOptions)
	})

	routerInstance.add("/chooseables", view)

	return view
}
