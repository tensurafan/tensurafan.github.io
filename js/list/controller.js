app.initIndexView = async function(volumes){
	try{
		var template = await fetch("js/list/view.html").then(owo=>owo.text())
	}
	catch(uwu){
		this.jumpto("error")(uwu)
	}

	let view = proxymity(template, {volumes})

	return view
}
