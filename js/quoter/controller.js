app.initQuoter = async function(){
	let template = await fetch("/js/quoter/view.html").then(owo=>owo.text())
	let view = proxymity(template, {
		element: null,
		url: ""
	})

	proxymity.watch(view.app, "element", (attachedTo)=>{
		if (attachedTo){
			view.appendTo(attachedTo)
		}
		else{
			view.detach()
			view.app.url = ""
		}
	})

	return view
}
