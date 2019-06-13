app.updateSettings = function(settings){
	let currentSettingState = app.getSettings()
	let newSettings = Object.assign({}, currentSettingState, settings)

	localStorage.setItem("_app_state", JSON.stringify(newSettings))
}

app.getSettings = function(){
	return JSON.parse(localStorage.getItem("_app_state")) || {id: "_app_state"}
}
