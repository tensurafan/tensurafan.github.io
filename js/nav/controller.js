app.initNav = async function(currentConfigs, routerInstance){
	let template = await fetch("/js/nav/view.html").then(owo=>owo.text())

	let view = proxymity(template, {
		configs: currentConfigs,
		menuOpen: false,
		back: ()=>{
			routerInstance.path !== "/" && routerInstance.back()
		},
		backClickable: false,
		goHome: ()=>routerInstance.rout("/")
	})

	routerInstance.on.rout(path=>{
		if (path === "/"){
			view.app.backClickable = false
		}
		else{
			view.app.backClickable = true
		}
	})

	return view
}
