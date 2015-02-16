Template.personaDetailsDialog.rendered = function(){
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
};

Template.personaDetailsDialog.helpers({
	
});

Template.personaDetailsDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail()
	},
	"change #nameInput": function(event){
		var input = event.currentTarget.value;
		Characters.update( this.charId, {$set: {name: input}} );
	},
	"change #alignmentInput": function(event){
		var input = event.currentTarget.value;
		Characters.update( this.charId, {$set: {alignment: input}} );
	},
	"change #genderInput": function(event){
		var input = event.currentTarget.value;
		Characters.update( this.charId, {$set: {gender: input}} );
	},
	"change #raceInput": function(event){
		var input = event.currentTarget.value;
		Characters.update( this.charId, {$set: {race: input}} );
	}
});
