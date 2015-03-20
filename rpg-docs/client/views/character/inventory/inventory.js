Template.inventory.created = function(){
	this.showAddButtons = new ReactiveVar(false);
}

Template.inventory.helpers({
	containers: function(){
		return Containers.find({charId: this._id}, {sort: {color: 1, name: 1}})
	},
	items: function(charId, containerId){
		return Items.find({charId: charId, "parent.id": containerId }, {sort: {color: 1, name: 1}});
	},
	equipment: function(){
		return Items.find({ charId: this._id, enabled: true }, {sort: {color: 1, name: 1}});
	},
	showAddButtons: function(){
		return Template.instance().showAddButtons.get();
	},
	colorClass: function(){
		return getColorClass(this.color)
	},
	netWorth: function(){
		var worth = 0;
		Items.find({charId: this._id}, {fields: {value : 1, quantity: 1}}).forEach(function(item){
			worth += item.totalValue();
		});
		return worth;
	},
	weightCarried: function(){
		var weight = 0;
		Containers.find({charId: this._id, isCarried: true}).forEach(function(container){
			weight += container.totalWeight();
		});
		Items.find({charId: this._id, "parent.id": this._id}, {fields: {weight : 1, quantity: 1}}).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	},
	equipmentValue: function(){
		var value = 0;
		Items.find({charId: this._id, enabled: true}, {fields: {value : 1, quantity: 1}}).forEach(function(item){
			value += item.totalValue();
		});
		return value;
	},
	equipmentWeight: function(){
		var weight = 0;
		Items.find({charId: this._id, enabled: true}, {fields: {weight : 1, quantity: 1}}).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	}
});

Template.inventory.events({
	"tap #addItem": function(event){
		var charId = this._id;
		var container = Containers.findOne({charId: charId}, {sort: {name: 1, _id: 1}, fields: {_id: 1}});
		var containerId;
		if(container){
			containerId = container._id;
		} else{
			console.log("no container was found for new item, adding a new container");
			containerId = Containers.insert({name: "New Container", isCarried: true, charId: this._id});
		}
		_.defer(function(){
			var itemId = Items.insert({
				charId: charId, 
				parent:{
					id: containerId,
					collection: "Containers"
				} 
			});
			GlobalUI.setDetail({
				template: "itemDialog",
				data:     {itemId: itemId, charId: charId},
				heroId:   itemId
			});
		});
	},
	"tap #addContainer": function(event){
		var containerId = Containers.insert({name: "New Container", isCarried: true, charId: this._id});
		GlobalUI.setDetail({
			template: "containerDialog",
			data:     {containerId: containerId, charId: this.charId},
			heroId:   containerId
		});
	},
	"tap .inventoryItem": function(event){
		var itemId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "itemDialog",
			data:     {itemId: itemId, charId: charId},
			heroId:   itemId
		});
	},
	"tap .containerTop": function(event){
		GlobalUI.setDetail({
			template: "containerDialog",
			data:     {containerId: this._id, charId: this.charId},
			heroId:   this._id
		});
	},
	"tap .carriedCheckbox": function(event){
		event.stopPropagation();
	},
	"change .carriedCheckbox": function(event){
		var carried;
		if(this.isCarried) carried = false;
		else carried = true;
		Containers.update(this._id, {$set: {isCarried: carried}});
	}
});

Template.inventoryItem.helpers({
	ne1: function(num){
		return num !== 1;
	},
	hidden: function(){
		return Session.equals("inventory.dragItemId", this._id)? "hidden" : null;
	}
});

Template.layout.events({
	"dragstart .inventoryItem": function(event, instance){
		Session.set("inventory.dragItemId", this._id);
		Session.set("inventory.dragItemOriginalContainer", this.container);
		Session.set("inventory.dragItemOriginalCharacter", this.charId);
	},
	"dragend .inventoryItem": function(event, instance){
		resetInvetorySession();
	},
	"dragover .itemContainer": function(event, instance){
		event.preventDefault();
	},
	"dragover .equipmentContainer": function(event, instance){
		event.preventDefault(); //this is a valid drop zone
	},
	"drop .itemContainer": function(event, instacne){
		var item = Items.findOne(Session.get("inventory.dragItemId"));
		//move item to the container
		item.moveToContainer(this._id)
		resetInvetorySession();
	},
	"drop .equipmentContainer": function(event, instance){
		var charId = Session.get("inventory.dragItemOriginalCharacter");
		var item = Items.findOne(Session.get("inventory.dragItemId"));
		item.equip(charId);
		resetInvetorySession();
	}
})

var resetInvetorySession = function(){
	_.defer(function(){
		Session.set("inventory.dragItemId", null);
		Session.set("inventory.dragItemOriginalContainer", null);
		Session.set("inventory.dragItemOriginalCharacter", null);
	})
}
