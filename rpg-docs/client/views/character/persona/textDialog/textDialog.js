Template.textDialog.rendered = function(){
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

Template.textDialog.helpers({
	value: function(){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[this.field] = 1;
		var char = Characters.findOne(this.charId, fieldSelector);
		return char[this.field];
	}
});

Template.textDialog.events({
	"change #textInput": function(event){
		var input = event.currentTarget.value;
		var setter = {$set: {}};
		setter.$set[this.field] = input;
		Characters.update(this.charId, setter);
	},
	"tap #backButton": function(){
		GlobalUI.closeDetail()
	},
});