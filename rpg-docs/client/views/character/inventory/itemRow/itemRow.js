Template.itemRow.helpers({
	isSelected: function(){
		return Session.get('selectedItemRow')=== this._id;
	}
});

Template.itemRow.events({
	"click": function(e){
		if(Session.get('selectedItemRow')=== this._id){
			Session.set('selectedItemRow', null);
		} else{
			Session.set('selectedItemRow', this._id);
		}
	}
});