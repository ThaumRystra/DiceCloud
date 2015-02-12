Template.containerDialog.rendered = function(){
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

Template.containerDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	},
	"tap #deleteContainer": function(){
		Containers.remove(this._id);
		GlobalUI.closeDetail();
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
	},
	"core-select .colorDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		Containers.update(this._id, {$set: {color: value}});
	}
});

Template.containerDialog.helpers({
	container: function(){
		return Containers.findOne(this.containerId);
	},
	colorClass: function(){
		return getColorClass(this.color)
	}
});