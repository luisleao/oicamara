var PRESENTATION_WIDTH = 1440;//900;
var PRESENTATION_HEIGHT = 900;

chrome.app.runtime.onLaunched.addListener(function() {
	//chrome.app.window.create('main.html', {'state': 'fullscreen' });
	chrome.app.window.create('main.html');
});
