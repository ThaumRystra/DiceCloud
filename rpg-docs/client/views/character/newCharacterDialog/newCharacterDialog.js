Template.newCharacterDialog.events({
	"tap #addButton": function(event, instance){
		Characters.insert({
			name: instance.find("#nameInput").value,
			gender: instance.find("#genderInput").value,
			race: instance.find("#raceInput").value,
			owner: Meteor.userId()
		}, function(err, id){
			if(err) throw err;
			Router.go("characterSheet", {_id: id});
		});
	}
});
