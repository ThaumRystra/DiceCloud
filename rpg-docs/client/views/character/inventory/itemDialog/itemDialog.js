var getContainers = function(charId){
	return Containers.find({charId: charId}, {sort: {name: 1, _id: 1}, fields: {name: 1}}).fetch();
};

var equipmentSlots =  [
	{name: "None", value: "none"},
	{name: "Held", value: "held"},
	{name: "Armor", value: "armor"},
	{name: "Head", value: "head"},
	{name: "Arms", value: "arms"}, 
	{name: "Hands", value: "hands"},
	{name: "Feet", value: "feet"}
];

Template.itemDialog.helpers({
	item: function(){
		return Items.findOne(this.itemId);
	},
	containers: function(){
		return getContainers(this.charId);
	},
	containerIndex: function(){
		var containers = getContainers(this.charId);
		var containerIds = _.pluck(containers, "_id");
		return _.indexOf(containerIds, this.container);
	},
	equipmentSlots: function(){
		return equipmentSlots;
	},
	equipmentSlotIndex: function(){
		return _.indexOf(_.pluck(equipmentSlots, "value"), this.equipmentSlot);
	},
	canEquip: function(){
		return this.equipmentSlot !== "none";
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
		Items.remove(instance.data.itemId);
		GlobalUI.closeDetail()
	},
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #itemNameInput, input #itemNameInput": function(event){
		console.log("changed Nameinput")
		var name = Template.instance().find("#itemNameInput").value;
		Items.update(this._id, {$set: {name: name}});
	},
	"change #itemPluralInput, input #itemPluralInput": function(event){
		var plural = Template.instance().find("#itemPluralInput").value;
		Items.update(this._id, {$set: {plural: plural}});
	},
	"change #quantityInput, input #quantityInput": function(event){
		var quantity = +Template.instance().find("#quantityInput").value;
		Items.update(this._id, {$set: {quantity: quantity}});
	},
	"change #weightInput, input #weightInput": function(event){
		var weight = +Template.instance().find("#weightInput").value;
		Items.update(this._id, {$set: {weight: weight}});
	},
	"change #valueInput, input #valueInput": function(event){
		var value = +Template.instance().find("#valueInput").value;
		Items.update(this._id, {$set: {value: value}});
	},
	"change #itemDescriptionInput": function(event){
		var description = Template.instance().find("#itemDescriptionInput").value;
		Items.update(this._id, {$set: {description: description}});
	},
	"change #equippedInput": function(event){
		var equipped = Template.instance().find("#equippedInput").checked;
		Items.update(this._id, {$set: {equipped: equipped}});
	},
	"core-select #containerDropDown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var containerId = detail.item.getAttribute("containerId");
		Items.update(Template.currentData().itemId, {$set: {container: containerId}});
	},
	"core-select #slotDropDown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("value");
		Items.update(Template.currentData().itemId, {$set: {equipmentSlot: value}});
	}
});
