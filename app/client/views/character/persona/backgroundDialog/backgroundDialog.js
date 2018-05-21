Template.backgroundDialog.helpers({
	value: function(){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[this.field] = 1;
		var char = Characters.findOne(this.charId, fieldSelector);
		return char[this.field];
	}
});
