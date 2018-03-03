Session.setDefault("isPrinting", false);
if (window.matchMedia) {
	var mediaQueryList = window.matchMedia("print");
	mediaQueryList.addListener(function(mql) {
		if (mql.matches) {
			Session.set("isPrinting", true);
			Tracker.flush();
		} else {
			Session.set("isPrinting", false);
		}
	});
}
