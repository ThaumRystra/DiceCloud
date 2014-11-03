Template.home.events({
	"click #addCharacter": function (event, template) {
		Characters.insert(new Character(Meteor.userId()));
	},
	"click #nukeCharacters": function(event, template){
		while(true){
			if(!Characters.findOne()) break;
			Characters.remove(Characters.findOne()._id);
		}
	}
});