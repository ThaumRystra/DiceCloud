Template.inventory.created = function(){
	this.showAddButtons = new ReactiveVar(false);
}

Template.inventory.helpers({
	containers: function(){
		return Containers.find({charId: this._id})
	},
	items: function(charId, containerId){
		return Items.find({charId: charId, equipped: false, container: containerId })
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
