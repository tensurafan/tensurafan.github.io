app.updateSettings = function(settings){
	let currentSettingState = app.getSettings()
	let newSettings = Object.assign({}, currentSettingState, setting)

	localStorage.setItem("_app_state", JSON.stringify(newSettings))
}

app.getSettings = function(){
	return JSON.parse(localStorage.getItem("_app_state")) || {id: "_app_state"}
}
