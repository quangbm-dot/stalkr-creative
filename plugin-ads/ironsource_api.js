
function getScript(t, e) {
	var i = document.createElement("script");
	i.type = "text/javascript", i.async = !0, e && (i.onload = e), i.src = t, document.head.appendChild(i)
}

function parseMessage(t) {
	var e = t.data,
		i = e.indexOf(DOLLAR_PREFIX + RECEIVE_MSG_PREFIX);
	return -1 !== i ? getMessageParams(e.slice(i + 2)) : {}
}

function getMessageParams(t) {
	var e, i = [],
		n = t.split("/"),
		r = n.length;
	if (-1 === t.indexOf(RECEIVE_MSG_PREFIX)) {
		if (r >= 2 && r % 2 == 0)
			for (e = 0; r > e; e += 2) i[n[e]] = n.length < e + 1 ? null : decodeURIComponent(n[e + 1])
	} else {
		var s = t.split(RECEIVE_MSG_PREFIX);
		void 0 !== s[1] && (i = JSON && JSON.parse(s[1]))
	}
	return i
}

function getDapi(t) {
	var e = parseMessage(t);
	e && e.name !== GET_DAPI_URL_MSG_NAME || getScript(e.data, onDapiReceived)
}

function invokeDapiListeners() {
	for (var t in dapiEventsPool) dapiEventsPool.hasOwnProperty(t) && dapi.addEventListener(t, dapiEventsPool[t])
}

function onDapiReceived() {
	dapi = window.dapi, window.removeEventListener("message", getDapi), invokeDapiListeners()
}

function init() {
	console.log('init!!!');
	window.dapi.isDemoDapi && (window.parent.postMessage(DOLLAR_PREFIX + SEND_MSG_PREFIX + JSON.stringify({
		state: "getDapiUrl"
	}), "*"), window.addEventListener("message", getDapi, !1))
}
var DOLLAR_PREFIX = "$$",
	RECEIVE_MSG_PREFIX = "DAPI_SERVICE:",
	SEND_MSG_PREFIX = "DAPI_AD:",
	GET_DAPI_URL_MSG_NAME = "connection.getDapiUrl",
	dapiEventsPool = {},
	dapi = window.dapi || {
		isReady: function () {
			return !1
		},
		addEventListener: function (t, e) {
			dapiEventsPool[t] = e
		},
		removeEventListener: function (t) {
			delete dapiEventsPool[t]
		},
		isDemoDapi: !0
	};

function onReadyCallback() {
	dapi.removeEventListener("ready", onReadyCallback);
	dapi.getAudioVolume();

	// localStorage.removeItem("cocosSoundState");

	dapi.isViewable() && adVisibleCallback({
		isViewable: !0
	}), dapi.addEventListener("viewableChange", adVisibleCallback), dapi.addEventListener("adResized", adResizeCallback), dapi.addEventListener("audioVolumeChange", audioVolumeChangeCallback)
}

function adVisibleCallback(t) {
	console.log("isViewable " + t.isViewable), t.isViewable && (screenSize = dapi.getScreenSize())
}

function adResizeCallback(t) {
	screenSize = t, console.log("ad was resized width " + t.width + " height " + t.height)
}

function userClickedDownloadButton(t) {
	dapi.openStoreUrl()
}

function audioVolumeChangeCallback(t) {
	let isAudioEnabled = !!t;
	if (isAudioEnabled) {
		//START or turn on the sound
		localStorage.setItem("cocosSoundState", 1)
	} else {
		//PAUSE the turn off the sound
		localStorage.setItem("cocosSoundState", 2)
	}
}
init();
window.addEventListener('load', function () {
	dapi.isReady() ? onReadyCallback() : dapi.addEventListener("ready", onReadyCallback)
});

