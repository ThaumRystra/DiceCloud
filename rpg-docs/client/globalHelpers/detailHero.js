Template.registerHelper("detailHero", function(){
	if ( Session.equals("global.ui.detailHeroId", this._id) ) {
		return "hero";
	}
});