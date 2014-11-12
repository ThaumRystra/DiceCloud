Template.inventoryTables.helpers({
	containers: function(){
		return Containers.find({owner: this._id});
	}
});