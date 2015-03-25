Template.splitStackDialog.helpers({
	quantity: function(){
		var item = Items.findOne(this.id);
		if(item) return Math.round(item.quantity/2);
	}
});

Template.splitStackDialog.events({
	'tap #moveButton': function(event, instance){
		var item = Items.findOne(this.id);
		if(item){
			item.splitToParent(
				{collection: this.parentCollection , id: this.parentId}, 
				+instance.find('#quantityInput').value
			);
		}
	},
	'tap #oneButton':function(event, instance){
		instance.find('#quantityInput').value = 1;
	},
	'tap #halfButton':function(event, instance){
		instance.find('#quantityInput').value = Math.round(Items.findOne(this.id).quantity/2);
	},
	'tap #allButton':function(event, instance){
		instance.find('#quantityInput').value = Items.findOne(this.id).quantity;
	}
});
