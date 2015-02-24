Template.healthCard.events({
	"change #hitPointSlider": function(event){
		var value = event.currentTarget.value;
		var adjustment = value - this.attributeBase("hitPoints");
		Characters.update(this._id, {$set: {"hitPoints.adjustment": adjustment}});
	}
});
