app.initTextSearcher = async function(routerInstance, appBody){
	let template = await fetch("/js/search-text/view.html").then(owo=>owo.text())


	let searcher = new TextNodeSearcher({container: appBody})

	let view = proxymity(template, {
		display: false,
		searchedText: "",
		nextTerm: function(){
			searcher.selectNext()
		},
		lastTerm: function(){
			searcher.selectPrevious()
		},
	})

	proxymity.watch(view.app, "display", function(shouldDisplay){
		if (!shouldDisplay){
			view.app.searchedText = ""
			return view.detach()
		}

		if (shouldDisplay){
			view.appendTo(appBody)
		}
	})

	proxymity.watch(view.app, "searchedText", function(newSearchTerm){
		searcher.setQuery(newSearchTerm)
		if (newSearchTerm === ""){
			searcher.unhighlight()
		}
		else if (newSearchTerm.length >= 3){
			searcher.highlight()
		}
	})

	routerInstance.on.rout(function(){
		view.app.appendTo = null
	})

	return view
}
