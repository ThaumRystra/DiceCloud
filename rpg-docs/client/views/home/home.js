Template.home.events({
	"click #addCharacter": function (event, template) {
		Characters.insert(new Character(Meteor.userId()));
	},
	"click #delete": function(event, template){
		Characters.remove(this._id);
	}
});