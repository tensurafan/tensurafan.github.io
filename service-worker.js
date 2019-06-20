const URL_REGEX = /(href|src)=['"]([^'"]+)['"]|fetch\(['"]([^'"]+)['"]\)/gi
const CACHE_NAME = "assets"

async function makeRequestAndCachePathsRecursive(path, exploredPath = []){
	if (exploredPath.some(cachedPath=>cachedPath === path)){
		return
	}
	exploredPath.push(path)

	let resultingData = await intelegentFetch(path)
		.then(owo=>owo.text())
		.catch(uwu=>{
			console.warn("Caching of asset failed", uwu)
		})

	let urlList = []
	let matched
	while (matched = URL_REGEX.exec(resultingData)){
		let src = matched[2]
		let fetched = matched[3]

		src && urlList.push(src)
		fetched && urlList.push(fetched)
	}

	urlList = urlList.filter(url=>(/(^\/|^http(s):\/\/cdn)/).test(url))

	console.log(urlList)

	let updateList = urlList.map(uri=>makeRequestAndCachePathsRecursive(uri, exploredPath))
	await Promise.all(updateList)
}

async function intelegentFetch(req){
	let storage = await caches.open(CACHE_NAME)

	let cachedAsset

	if (cachedAsset = await storage.match(req)){
		let cachedEtag = cachedAsset.headers.get("etag")

		let remoteHeaders = await fetch(req, {
			method: "HEAD",
		}).catch(uwu=>console.warn(uwu))

		if (!remoteHeaders || !remoteHeaders.headers || !remoteHeaders.headers.get("etag") || remoteHeaders.headers.get("etag") === cachedEtag){
			return cachedAsset
		}
	}

	let res = await fetch(req)

	if (!res.ok){
		return Promise.reject(res)
	}

	await storage.put(req, res.clone())
	return res
}


self.addEventListener("install", function(ev){
	ev.waitUntil(makeRequestAndCachePathsRecursive("/"))
})

self.addEventListener("fetch", function(ev){
	if (
		(/^\/sw\/refresh$/).test(ev.request.url.replace(ev.target.location.origin, ""))
	){
		ev.respondWith(
			makeRequestAndCachePathsRecursive("/")
				.then(()=>intelegentFetch("/"))
		)
	}
	else{
		ev.respondWith(intelegentFetch(ev.request).catch(()=>intelegentFetch("/")))
	}
})
