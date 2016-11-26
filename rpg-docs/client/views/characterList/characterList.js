Template.characterList.helpers({
	characterDetails: function(charId){
		var char = Characters.findOne(
			charId,
			{fields: {name: 1, gender: 1, alignment: 1, race:1, color: 1}}
		);
		char.charId = charId;
		char.title = char.name;
		char.field = "base";
		char.class = "characterCard";

		// Add ability scores to the character
		abilities.forEach(function(ability) {
			char[ability] = Characters.calculate.attributeValue(charId, ability);
		});

		return char;
	}
});

Template.characterList.events({
	"tap .characterCard": function(event, instance){
		Router.go("characterSheet", {_id: this._id});
	},
	"tap .addCharacter": function(event, template) {
		GlobalUI.showDialog({
			heading: "New Character",
			template: "newCharacterDialog",
		});
	},
});
