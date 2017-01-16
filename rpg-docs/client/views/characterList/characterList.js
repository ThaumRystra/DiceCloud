Template.characterList.helpers({
	characters(){
		var userId = Meteor.userId();
		return Characters.find(
			{
				$or: [
					{readers: userId},
					{writers: userId},
					{owner: userId},
				]
			},
			{
				fields: {name: 1, picture: 1, color: 1, race: 1, alignment: 1, gender: 1},
				sort: {name: 1},
			}
		);
	},
	initials(name){
		return name.replace(/[^A-Z]/g, "");
	},
})

Template.characterList.events({
	"tap .addCharacter": function(event, template) {
		GlobalUI.showDialog({
			heading: "New Character",
			template: "newCharacterDialog",
		});
	},
});
