Template.home.events({
	"click #addCharacter": function (event, template) {
		Characters.insert({});
	},
	"click .delete": function(event, template){
		Characters.remove(this._id);
	}
});