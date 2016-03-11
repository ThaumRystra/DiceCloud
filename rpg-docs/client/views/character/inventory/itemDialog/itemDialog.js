var getContainers = function(charId){
	return Containers.find(
		{charId: charId},
		{sort: {name: 1, _id: 1}, fields: {name: 1}}
	);
};

Template.itemDialog.onCreated(function(){
	this.editing = new ReactiveVar(!!this.data.startEditing);
});

Template.itemDialog.helpers({
	item: function(){
		return Items.findOne(this.itemId);
	},
	editing: function(){
		return Template.instance().editing.get();
	},
	itemHeading: function(){
		if (this.quantity === 1){
			return this.name;
		} else {
			var pName = this.plural || this.name;
			return this.quantity + " " + pName;
		}
	},
});

Template.itemDialog.events({
	"tap #editButton": function(event, instance){
		instance.editing.set(true);
	},
	"tap #doneEditingButton": function(event, instance){
		instance.editing.set(false);
	},
	"color-change": function(event, instance){
		Items.update(instance.data.itemId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Items.softRemoveNode(instance.data.itemId);
		GlobalUI.deletedToast(instance.data.itemId, "Items", "Item");
		GlobalUI.closeDetail();
	},
});

Template.itemEdit.onRendered(function(){
	updatePolymerInputs(this);
});

Template.itemEdit.helpers({
	ne1: function(num){
		return num != 1;
	},
});

Template.itemEdit.events({
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #itemNameInput": function(event){
		var name = Template.instance().find("#itemNameInput").value;
		Items.update(this._id, {$set: {name: name}});
	},
	"icon-selected": function(event, template){
		var icon = event.originalEvent.detail;
		Items.update(template.data._id, {$set: {icon: icon}});
	},
	"change #itemPluralInput": function(event){
		var plural = Template.instance().find("#itemPluralInput").value;
		Items.update(this._id, {$set: {plural: plural}});
	},
	"change #quantityInput": function(event){
		var quantity = +Template.instance().find("#quantityInput").value;
		Items.update(this._id, {$set: {quantity: quantity}});
	},
	"change #weightInput": function(event){
		var weight = +Template.instance().find("#weightInput").value;
		Items.update(this._id, {$set: {weight: weight}});
	},
	"change #valueInput": function(event){
		var value = +Template.instance().find("#valueInput").value;
		Items.update(this._id, {$set: {value: value}});
	},
	"change #itemDescriptionInput": function(event){
		var description = Template.instance().find("#itemDescriptionInput").value;
		Items.update(this._id, {$set: {description: description}});
	},
	"change #equippedInput": function(event){
		var equipped = Template.instance().find("#equippedInput").checked;
		if (equipped){
			Meteor.call("equipItem", this._id, this.charId);
		} else {
			Meteor.call("unequipItem", this._id, this.charId);
		}
	},
	"change #incrementCheckbox": function(event){
		var value = event.currentTarget.checked;
		Items.update(this._id, {$set: {"settings.showIncrement": value}});
	},
	"change #attunementCheckbox": function(event){
		var value = event.currentTarget.checked;
		Items.update(this._id, {$set: {requiresAttunement: value}});
	},
});

Template.containerDropdown.helpers({
	containers: function(){
		return getContainers(this.charId);
	}
});

Template.containerDropdown.events({
	"core-select #containerDropDown": function(event){
		var detail = event.originalEvent.detail;
		if (!detail.isSelected) return;
		var containerId = detail.item.getAttribute("name");
		Meteor.call("moveItemToContainer", Template.currentData()._id, containerId);
	}
});
