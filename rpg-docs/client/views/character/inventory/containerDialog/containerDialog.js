Template.containerDialog.helpers({
	container: function(){
		return Containers.findOne(this.containerId);
	}
});

Template.containerDialog.events({
	"color-change": function(event, instance){
		Containers.update(instance.data.containerId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Containers.softRemoveNode(instance.data.containerId);
		GlobalUI.deletedToast(
			instance.data.containerId,
			"Containers", "Container and contents"
		);
		GlobalUI.closeDetail();
	},
});

Template.containerEdit.onRendered(function(){
	updatePolymerInputs(this);
});

Template.containerEdit.events({
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #containerNameInput": function(event){
		var name = Template.instance().find("#containerNameInput").value;
		Containers.update(this._id, {$set: {name: name}});
	},
	"icon-selected": function(event, template){
		var icon = event.originalEvent.detail;
		Containers.update(template.data._id, {$set: {icon: icon}});
	},
	"change #weightInput, input #weightInput": function(event){
		var weight = +Template.instance().find("#weightInput").value;
		Containers.update(this._id, {$set: {weight: weight}});
	},
	"change #valueInput, input #valueInput": function(event){
		var value = +Template.instance().find("#valueInput").value;
		Containers.update(this._id, {$set: {value: value}});
	},
	"change #containerDescriptionInput": function(event, instance){
		var description = instance.find("#containerDescriptionInput").value;
		Containers.update(this._id, {$set: {description: description}});
	},
});
