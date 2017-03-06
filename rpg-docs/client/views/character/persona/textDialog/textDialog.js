Template.textDialog.helpers({
	value: function(){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[this.field] = 1;
		var char = Characters.findOne(this.charId, fieldSelector);
		return char[this.field];
	}
});

Template.textDialogEdit.helpers({
	value: function(){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[this.field] = 1;
		var char = Characters.findOne(this.charId, fieldSelector);
		return char[this.field];
	}
});

Template.textDialogEdit.events({
	"input #textInput": _.debounce(function(event){
		var input = event.currentTarget.value;
		Characters.update(this.charId, {
			$set: {[this.field]: input}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}, 300),
});
