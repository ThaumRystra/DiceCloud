Template.registerHelper("detailHero", function(suffix){
	var id = suffix? this._id + suffix : this._id;
	if ( Session.equals("global.ui.detailHeroId", id) ) {
		return "hero";
	}
});