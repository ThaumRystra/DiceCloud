Template.registerHelper("detailHero", function(suffix, givenId) {
	var id = givenId || this._id;
	if (suffix) {
		id += suffix;
	}
	if (Session.equals("global.ui.detailHeroId", id)) {
		return "hero";
	}
});
