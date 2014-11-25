Template.containerTable.helpers({
	items: function(){
		return Items.find({container: this._id});
	}
});