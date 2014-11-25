Template.registerHelper("canCast", function(){
	return Characters.find({_id: this._id, spells: {$size: 0}}).count() === 0;
});