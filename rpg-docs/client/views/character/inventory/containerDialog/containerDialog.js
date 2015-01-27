Template.containerDialog.rendered = function(){
	var self = this;
	this.autorun(function(){
		var container = Containers.findOne(Template.currentData().containerId, {fields: {name: 1}});
		if(container) Session.set("global.ui.dialogHeader", container.name);
	})
	//after the dialog is built, open it
	_.defer(function(){GlobalUI.dialog.open()});
}

Template.containerDialog.events({
	"tap #deleteContainer": function(){
		Containers.remove(this._id);
		GlobalUI.closeDialog()
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #containerNameInput, input #containerNameInput": function(event){
		console.log("changed Nameinput")
		var name = Template.instance().find("#containerNameInput").value;
		Containers.update(this._id, {$set: {name: name}});
	},
	"change #weightInput, input #weightInput": function(event){
		var weight = Template.instance().find("#weightInput").value;
		Containers.update(this._id, {$set: {weight: weight}});
	},
	"change #valueInput, input #valueInput": function(event){
		var value = Template.instance().find("#valueInput").value;
		Containers.update(this._id, {$set: {value: value}});
	},
	"change #containerDescriptionInput": function(event){
		var description = Template.instance().find("#containerDescriptionInput").value;
		Containers.update(this._id, {$set: {description: description}});
	}
});

Template.containerDialog.helpers({
	container: function(){
		return Containers.findOne(this.containerId);
	}
});