Template.home.events({
	"click #addCharacter": function (event, template) {
		Characters.insert({});
	},
	"click #deleteChar": function(event, template){
		console.log("deleting", this);
		Characters.remove(this._id);
	}
});