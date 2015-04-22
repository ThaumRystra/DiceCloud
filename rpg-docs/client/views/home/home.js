Template.home.helpers({
	characterDetails: function(){
		var char = Characters.findOne(
			this._id,
			{fields: {name: 1, gender: 1, alignment: 1, race:1}}
		);
		char.title = char.name;
		char.field = "base";
		char.color = "d";
		char.class = "characterCard";
		return char;
	}
});

Template.home.events({
	"tap .characterCard": function(event, instance){
		Router.go("characterSheet", {_id: this._id});
	},
	"tap #addCharacter": function(event, template) {
		Characters.insert({owner: Meteor.userId()});
	},
	"tap #deleteChar": function(event, template){
		Characters.remove(this._id);
	},
});
