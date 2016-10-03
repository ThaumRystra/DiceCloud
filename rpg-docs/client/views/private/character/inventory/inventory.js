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
		return Buffs.find({
			charId: this._id,
			type: "inate",
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
		Items.find({charId: this._id, enabled: true},
				   {fields: {weight : 1, quantity: 1}}
				  ).forEach(function(item){
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
	"tap .addItem": function(event){
		var charId = this._id;
		Items.insert({
			charId: charId,
			parent:{
				id: charId,
				collection: "Characters",
			},
		}, function(err, itemId){
			if (err) throw err;
			GlobalUI.setDetail({
				template: "itemDialog",
				data:     {itemId: itemId, charId: charId, startEditing: true},
				heroId:   itemId,
			});
		});
	},
	"tap .addContainer": function(event){
		var containerId = Containers.insert({
			name: "New Container",
			isCarried: true,
			charId: this._id,
		});
		GlobalUI.setDetail({
			template: "containerDialog",
			data:     {
				containerId: containerId,
				charId: this.charId,
				startEditing: true,
			},
			heroId:   containerId,
		});
	},
	"tap .weightCarried": function(event) {
		var charId = this._id;
		GlobalUI.setDetail({
			template: "carryDialog",
			data:     {charId: charId, color: "green"},
			heroId:   charId + "weightCarried",
		});
	},
	"tap .buff": function(event){
		var buffId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "buffDialog",
			data:     {buffId: buffId, charId: charId},
			heroId:   buffId,
		});
	},
	"tap .inventoryItem": function(event){
		var itemId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "itemDialog",
			data:     {itemId: itemId, charId: charId},
			heroId:   itemId,
		});
	},
	"hold .inventoryItem": function(event, instance) {
		var itemId = this._id;
		var charId = Template.parentData()._id;
		var containerId = this.parent.id;
		GlobalUI.showDialog({
			template: "moveItemDialog",
			data:     {
				charId: charId,
				itemId: itemId,
				containerId: containerId,
			},
			heading:   "Move " + this.pluralName(),
		});
	},
	"tap .incrementButtons": function(event) {
		event.stopPropagation();
	},
	"tap .addItemQuantity": function(event) {
		var itemId = this._id;
		Items.update(itemId, {$set: {quantity: this.quantity + 1}});
	},
	"tap .subItemQuantity": function(event) {
		var itemId = this._id;
		Items.update(itemId, {$set: {quantity: this.quantity - 1}});
	},
	"tap .itemContainer .top": function(event){
		GlobalUI.setDetail({
			template: "containerDialog",
			data:     {containerId: this._id, charId: this.charId},
			heroId:   this._id,
		});
	},
	"tap .carriedCheckbox": function(event){
		event.stopPropagation();
	},
	"change .carriedCheckbox": function(event){
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
			GlobalUI.showDialog({
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
			GlobalUI.showDialog({
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
	},
	"drop .characterRepresentative": function(event, instance) {
		var itemId = event.originalEvent.dataTransfer.getData("dicecloud-id/items");
		if (event.ctrlKey){
			//split the stack to the container
			GlobalUI.showDialog({
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
	},
});
