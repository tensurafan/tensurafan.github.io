app.initNav = async function(currentConfigs, routerInstance){
	let template = await fetch("/js/nav/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		configs: currentConfigs,
		menuOpen: false,
		back: ()=>{
			window.location.pathname !== "/" && routerInstance.back()
		}
	})

	return view
}
