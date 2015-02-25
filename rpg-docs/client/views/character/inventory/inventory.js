Template.inventory.created = function(){
	this.showAddButtons = new ReactiveVar(false);
}

Template.inventory.helpers({
	containers: function(){
		return Containers.find({charId: this._id}, {sort: {color: 1, name: 1}})
	},
	items: function(charId, containerId){
		return Items.find({charId: charId, equipped: false, container: containerId }, {sort: {color: 1, name: 1}})
	},
	armor: function(){
		return Items.findOne({ charId: this._id, equipped: true, equipmentSlot: "armor" })
	},
	equipment: function(){
		return Items.find({ charId: this._id, equipped: true, equipmentSlot: {$ne: "armor"} })
	},
	showAddButtons: function(){
		return Template.instance().showAddButtons.get();
	},
	ne1: function(num){
		return num !== 1;
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
		Items.find({charId: this._id, equipped: false}, {fields: {weight : 1, quantity: 1}}).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	},
	equipmentValue: function(){
		var value = 0;
		Items.find({charId: this._id, equipped: true}, {fields: {value : 1, quantity: 1}}).forEach(function(item){
			value += item.totalValue();
		});
		return value;
	},
	equipmentWeight: function(){
		var weight = 0;
		Items.find({charId: this._id, equipped: true}, {fields: {weight : 1, quantity: 1}}).forEach(function(item){
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
			var itemId = Items.insert({charId: charId, container: containerId});
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
	}
});
