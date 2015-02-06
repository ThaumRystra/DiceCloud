Template.itemDialog.rendered = function(){
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

Template.itemDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	},
	"tap #deleteItem": function(){
		Items.remove(this._id);
		GlobalUI.closeDetail();
	},
	"tap #addEffectButton": function(){
		Effects.insert({
			charId: Template.currentData().charId,
			sourceId: this._id,
			operation: "add",
			type: "equipment"
		});
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
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
		var quantity = Template.instance().find("#quantityInput").value;
		Items.update(this._id, {$set: {quantity: quantity}});
	},
	"change #weightInput, input #weightInput": function(event){
		var weight = Template.instance().find("#weightInput").value;
		Items.update(this._id, {$set: {weight: weight}});
	},
	"change #valueInput, input #valueInput": function(event){
		var value = Template.instance().find("#valueInput").value;
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
	effects: function(){
		var cursor = Effects.find({charId: this.charId, type: "equipment", sourceId: this._id})
		return cursor;
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
