Template.noteDialog.events({
	"color-change": function(event, instance){
		Notes.update(instance.data.noteId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Notes.remove(instance.data.noteId);
		GlobalUI.closeDetail()
	},
	"change #noteNameInput, input #noteNameInput": function(event){
		var value = event.currentTarget.value
		Notes.update(this._id, {$set: {name: value}});
	},
	"change #noteDescriptionInput": function(event){
		var value = event.currentTarget.value
		Notes.update(this._id, {$set: {description: value}});
	}
});

Template.noteDialog.helpers({
	note: function(){
		return Notes.findOne(this.noteId);
	}
});