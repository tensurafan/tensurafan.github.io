app.initNav = async function(currentConfigs, routerInstance){
	let template = await fetch("/js/nav/view.html").then(owo=>owo.text())

	let version = await fetch("/build.txt").then(owo=>owo.text())

	let view = proxymity(template, {
		version,
		configs: currentConfigs,
		menuOpen: false,
		back: ()=>{
			routerInstance.path !== "/" && routerInstance.back()
		},
		backClickable: false,
		goHome: ()=>routerInstance.rout("/"),
		refreshCache: ()=>fetch('/sw/refresh').then(owo=>owo.text()).then(()=>document.location.reload())
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
