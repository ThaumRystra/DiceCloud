var getContainers = function(charId){
	return Containers.find({charId: charId}, {sort: {name: 1, _id: 1}, fields: {name: 1}}).fetch();
};

Template.itemDialog.helpers({
	item: function(){
		return Items.findOne(this.itemId);
	},
	containers: function(){
		return getContainers(this.charId);
	},
	ne1: function(num){
		return num != 1;
	}
});

Template.itemDialog.events({
	"color-change": function(event, instance){
		Items.update(instance.data.itemId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Items.softRemoveNode(instance.data.itemId);
		GlobalUI.deletedToast(instance.data.itemId, "Items", "Item");
		GlobalUI.closeDetail();
	},
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #itemNameInput": function(event){
		console.log("changed Nameinput");
		var name = Template.instance().find("#itemNameInput").value;
		Items.update(this._id, {$set: {name: name}});
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
		var item = Items.findOne(this._id);
		if(item){
			if(equipped){
				item.equip();
			} else {
				item.unequip();
			}
		}
	},
	"change #attunementCheckbox": function(event){
		var value = event.currentTarget.checked;
		Items.update(this._id, {$set: {requiresAttunement: value}});
	},
	"core-select #containerDropDown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var containerId = detail.item.getAttribute("name");
		var item = Items.findOne(Template.currentData().itemId);
		item.moveToContainer(containerId);
	}
});
