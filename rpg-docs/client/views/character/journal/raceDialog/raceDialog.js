Template.raceDialog.rendered = function(){
	var self = this;
	//update all autogrows after they've been filled
	var pata = this.$("paper-autogrow-textarea");
	pata.each(function(index, el){
		el.update($(el).children().get(0));
	})
	//update all input fields as well
	var input = this.$("paper-input");
	input.each(function(index, el){
		el.valueChanged();
	})
	//after the dialog is built, open it
	if (!this.alreadyRendered){
		Session.set("global.ui.detailShow", true);
		this.alreadyRendered = true;
	}
}

Template.raceDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail()
	},
	"tap #addEffectButton": function(){
		Effects.insert({
			charId: this.charId,
			operation: "add",
			type: "racial"
		});
	},
	"change #raceInput": function(event){
		var value = event.currentTarget.value;
		Characters.update(this.charId, {$set: {race: value}});
	}
});

Template.raceDialog.helpers({
	effects: function(){
		return Effects.find({charId: this.charId, type: "racial"});
	},
	race: function(){
		var char = Characters.findOne(this.charId, {fields: {race: 1}});
		return char && char.race;
	}
});