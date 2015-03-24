Template.undoToast.events({
	'tap #undoButton': function(event, instance){
		var collection = window[this.collection];
		if(!collection) return;
		collection.restore(this.id);
	}
});
