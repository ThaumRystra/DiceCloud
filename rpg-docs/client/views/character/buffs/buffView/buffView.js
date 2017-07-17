Template.buffView.helpers({
	name: function() {
		return this.name;
	}
});

Template.buffView.events({
	"change #enabledCheckbox": function(event){
		var enabled = !this.enabled;
		Buffs.update(this._id, {$set: {enabled: enabled}});
	},
})