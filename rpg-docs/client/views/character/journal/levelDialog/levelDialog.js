Template.levelDialog.events({
	"tap #deleteButton": function(event, instance){
		Levels.remove(instance.data.levelId);
		GlobalUI.closeDetail()
	},
	"change #levelValueInput": function(event){
		var value = event.currentTarget.value;
		Levels.update(this._id, {$set: {value: value}});
	}
});

Template.levelDialog.helpers({
	level: function(){
		return Levels.findOne(this.levelId);
	}
});