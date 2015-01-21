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
	}
});

Template.inventory.events({
	"tap #addItem": function(){
		GlobalUI.showDialog({
			template:     "itemDialog",
			data:         null,
			fullOnMobile: true
		})
	},
	"tap #addContainer": function(){
		Containers.insert({name: "New Container", isCarried: true, charId: this._id});
	}
})