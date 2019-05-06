Template.inventory.created = function(){
	this.showAddButtons = new ReactiveVar(false);
};

Template.inventory.helpers({
	containers: function(){
		return Containers.find({charId: this._id}, {sort: {color: 1, name: 1}});
	},
	items: function(charId, containerId){
		return Items.find(
			{charId: charId, "parent.id": containerId},
			{sort: {color: 1, name: 1}}
		);
	},
	attuned: function(){
		return Items.find(
			{charId: this._id, enabled: true, requiresAttunement: true},
			{sort: {color: 1, name: 1}}
		);
	},
	equipment: function(){
		return Items.find(
			{charId: this._id, enabled: true, requiresAttunement: false},
			{sort: {color: 1, name: 1}}
		);
	},
	carriedItems: function(){
		return Items.find(
			{charId: this._id, enabled: false, "parent.id": this._id},
			{sort: {color: 1, name: 1}}
		);
	},
	showAddButtons: function(){
		return Template.instance().showAddButtons.get();
	},
	colorClass: function(){
		return getColorClass(this.color);
	},
	netWorth: function(){
		var worth = 0;
		Items.find(
			{charId: this._id},
			{fields: {value : 1, quantity: 1}}
		).forEach(function(item){
			worth += item.totalValue();
		});
		Containers.find(
			{charId: this._id},
			{fields: {value : 1}}
		).forEach(function(container) {
			if (container.value) worth += container.value;
		});
		return worth;
	},
	weightCarried: function(){
		var weight = 0;
		Containers.find(
			{charId: this._id, isCarried: true}
		).forEach(function(container){
			weight += container.totalWeight();
		});
		Items.find(
			{charId: this._id, "parent.id": this._id},
			{fields: {weight : 1, quantity: 1}}
		).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	},
	encumberedBuffs: function(){
		return Conditions.find({
			charId: this._id,
			name: {$in: [
				"Encumbered",
				"Heavily encumbered",
				"Over encumbered",
				"Can't move load",
			]},
		});
	},
	equipmentValue: function(){
		var value = 0;
		Items.find(
			{charId: this._id, enabled: true},
			{fields: {value : 1, quantity: 1}}
		).forEach(function(item){
			value += item.totalValue();
		});
		return value;
	},
	equipmentWeight: function(){
		var weight = 0;
		Items.find({
			charId: this._id, enabled: true,
		}, {
			fields: {weight : 1, quantity: 1}
		}).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	},
	carriedValue: function(){
		var value = 0;
		Items.find(
			{charId: this._id, enabled: false, "parent.id": this._id},
			{fields: {value : 1, quantity: 1}}
		).forEach(function(item){
			value += item.totalValue();
		});
		return value;
	},
	carriedWeight: function(){
		var weight = 0;
		Items.find(
			{charId: this._id, enabled: false, "parent.id": this._id},
			{fields: {weight : 1, quantity: 1}}
		).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	},
});

Template.inventory.events({
	"click .addItem": function(event, instance){
		var charId = this._id;
		var itemId = Items.insert({
			charId: charId,
			parent:{
				id: charId,
				collection: "Characters",
			},
		});
		pushDialogStack({
			template: "itemDialog",
			data:     {itemId: itemId, charId: charId, startEditing: true},
			element:   event.currentTarget,
			returnElement: () => $(`[data-id='${itemId}']`).get(0),
		});
	},
	"click .libraryItem": function(event, instance){
		var charId = this._id;
		var itemId = Items.insert({
			charId: charId,
			parent:{
				id: charId,
				collection: "Characters",
			},
		});
		pushDialogStack({
			template: "itemLibraryDialog",
			element: event.currentTarget,
			callback: (result) => {
				if (!result) {
					Items.remove(itemId);
					return;
				}
				// Make the library item into a regular item
				let item = _.omit(result, "libraryName", "library", "attacks", "effects");
				if (item.settings && item.settings.category) delete item.settings.category;
				// Update the item to match library item
				Items.update(itemId, {$set: item});
				// Copy over attacks and effects
				_.each(result.attacks, (attack) => {
					attack.charId = charId;
					attack.parent = {id: itemId, collection: "Items"};
					Attacks.insert(attack);
				});
				_.each(result.effects, (effect) => {
					effect.charId = charId;
					effect.parent = {id: itemId, collection: "Items"};
					Effects.insert(effect);
				});
			},
			returnElement: () => $(`[data-id='${itemId}']`).get(0),
		})
	},
	"click .addContainer": function(event, instance){
		var containerId = Containers.insert({
			name: "New Container",
			isCarried: true,
			charId: this._id,
		});
		pushDialogStack({
			template: "containerDialog",
			data:     {
				containerId: containerId,
				charId: this.charId,
				startEditing: true,
			},
			element:   event.currentTarget,
			returnElement: instance.find(`.itemContainer[data-id='${containerId}']`),
		});
	},
	"click .weightCarried": function(event, instance) {
		var charId = this._id;
		pushDialogStack({
			template: "carryDialog",
			data:     {charId: charId, color: "green"},
			element:  event.currentTarget.parentElement,
		});
	},
	"click .condition": function(event, instance){
		pushDialogStack({
			template: "conditionViewDialogDialog",
			data:     {condition: this.condition},
			element:   event.currentTarget,
		});
	},
	"click .inventoryItem": function(event, instance){
		var itemId = this._id;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "itemDialog",
			data:     {itemId: itemId, charId: charId},
			element:   event.currentTarget,
			returnElement: () => $(`[data-id='${itemId}']`).get(0),
		});
	},
	"click .incrementButtons": function(event, instance) {
		event.stopPropagation();
	},
	"click .addItemQuantity": function(event, instance) {
		var itemId = this._id;
		Items.update(itemId, {$set: {quantity: this.quantity + 1}});
	},
	"click .subItemQuantity": function(event, instance) {
		var itemId = this._id;
		Items.update(itemId, {$set: {quantity: this.quantity - 1}});
	},
	"click .itemContainer .top": function(event, instance){
		pushDialogStack({
			template: "containerDialog",
			data:     {containerId: this._id, charId: this.charId},
			element:   event.currentTarget.parentElement,
		});
	},
	"click .carriedCheckbox": function(event, instance){
		event.stopPropagation();
	},
	"change .carriedCheckbox": function(event, instance){
		var carried;
		if (this.isCarried) carried = false;
		else carried = true;
		Containers.update(this._id, {$set: {isCarried: carried}});
	},
});

Template.inventoryItem.helpers({
	ne1: function(num){
		return num !== 1;
	},
	lt1: function(num) {
		return num < 1;
	},
	hidden: function(){
		return Session.equals("inventory.dragItemId", this._id) ? "hidden" : null;
	},
});

Template.layout.events({
	"dragstart .inventoryItem": function(event, instance){
		event.originalEvent.dataTransfer.setData("dicecloud-id/items", this._id);
		Session.set("inventory.dragItemId", this._id);
	},
	"dragover .itemContainer, dragenter .itemContainer":
	function(event, instance){
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			event.preventDefault();
		}
	},
	"dragover .equipmentContainer, dragenter .equipmentContainer":
	function(event, instance){
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			event.preventDefault();
		}
	},
	"dragover .carriedContainer, dragenter .carriedContainer":
	function(event, instance){
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			event.preventDefault();
		}
	},
	"dragover .characterRepresentative, dragenter .characterRepresentative":
	function(event, instance){
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			event.preventDefault();
		}
	},
	"dragend .inventoryItem": function(event, instance){
		Session.set("inventory.dragItemId", null);
	},
	"drop .itemContainer": function(event, instance){
		var itemId = event.originalEvent.dataTransfer.getData("dicecloud-id/items");
		if (event.ctrlKey){
			//split the stack to the container
			pushDialogStack({
				template: "splitStackDialog",
				data: {
					id: itemId,
					parentCollection: "Containers",
					parentId: this._id,
				},
			});
		} else {
			//move item to the container
			Meteor.call("moveItemToContainer", itemId, this._id);
		}
		Session.set("inventory.dragItemId", null);
	},
	"drop .equipmentContainer": function(event, instance){
		var itemId = event.originalEvent.dataTransfer.getData("dicecloud-id/items");
		Meteor.call("equipItem", itemId, this._id);
		Session.set("inventory.dragItemId", null);
	},
	"drop .carriedContainer": function(event, instance){
		var itemId = event.originalEvent.dataTransfer.getData("dicecloud-id/items");
		if (event.ctrlKey){
			//split the stack to the container
			pushDialogStack({
				template: "splitStackDialog",
				data: {
					id: itemId,
					parentCollection: "Characters",
				},
			});
		} else {
			//move item to the character
			Meteor.call("moveItemToCharacter", itemId, this._id);
		}
		Session.set("inventory.dragItemId", null);
	},
	"drop .characterRepresentative": function(event, instance) {
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			var itemId = event.originalEvent.dataTransfer.getData("dicecloud-id/items");
			if (event.ctrlKey){
				//split the stack to the container
				pushDialogStack({
					template: "splitStackDialog",
					data: {
						id: itemId,
						parentCollection: "Characters",
						parentId: this._id,
					},
				});
			} else {
				//move item to the character
				Meteor.call("moveItemToCharacter", itemId, this._id);
			}
			Session.set("inventory.dragItemId", null);
		}
	},
});
