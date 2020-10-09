	app.initChooseablesView = async function(termsChosen, termsOptions, routerInstance){
	var template = await fetch("/js/chooseables-config/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		termsChosen,
		termsOptions,
		termsList: Object.keys(termsOptions),
		log: function(){
			console.log.apply(console, Array.prototype.slice.call(arguments))
			return arguments[0]
		},
		setOfficial: function(){
			view.app.termsList.forEach(term=>{
				let officialTermIndex = termsOptions[term].officialTermIndex
				termsChosen[term] = termsOptions[term].options[officialTermIndex]
			})
			app.saveSettings()
		},
		setJank: function(){
			view.app.termsList.forEach(term=>{
				let lastIndex = termsOptions[term].options.length - 1
				termsChosen[term] = termsOptions[term].options[lastIndex]
			})
			app.saveSettings()
		},
		setRandom: function(){
			view.app.termsList.forEach(term=>{
				let lastIndex = termsOptions[term].options.length - 1
				let randomIndex = randomInt(lastIndex)
				termsChosen[term] = termsOptions[term].options[randomIndex]
			})
			app.saveSettings()
		},
		setDefault: function(){
			view.app.termsList.forEach(term=>{
				termsChosen[term] = termsOptions[term].options[0]
			})
			app.saveSettings()
		},
	})

	function randomInt(max = 1){
		max += .999999999
		return Math.floor(Math.random() * max)
	}

	routerInstance.add("/chooseables", view)

	return view
}
