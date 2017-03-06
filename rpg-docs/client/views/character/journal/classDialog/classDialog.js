const debounce = (f) => _.debounce(f, 300);

Template.classDialog.helpers({
	class: function(){
		return Classes.findOne(this.classId);
	}
});

Template.classDialog.events({
	"color-change": function(event, instance){
		Classes.update(instance.data.classId, {$set: {color: event.color}});
	},
	"click #deleteButton": function(event, instance){
		Classes.softRemoveNode(instance.data.classId);
		GlobalUI.deletedToast(instance.data.classId, "Classes", "Class");
		popDialogStack();
	},
	"input #classNameInput, change #classNameInput": debounce(function(event){
		var value = event.currentTarget.value;
		Classes.update(this._id, {
			$set: {name: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #levelValueInput, change #levelValueInput": debounce(function(event){
		var value = event.currentTarget.value;
		Classes.update(this._id, {
			$set: {level: value}
		}, {
			removeEmptyStrings: false,
		});
	}),
});
