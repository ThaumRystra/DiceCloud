Template.newCharacterDialog.events({
	"tap #addButton": function(event, instance){
		Characters.insert({
			name: instance.find("#nameInput").value,
			gender: instance.find("#genderInput").value,
			race: instance.find("#raceInput").value,
			owner: Meteor.userId(),
		}, function(err, id){
			if (err) throw err;
			var featureId = Features.insert({
				name: "Base Ability Scores",
				charId: id,
				enabled: true,
				alwaysEnabled: true,
			});
			var feature = Features.findOne({_id: featureId});
			Effects.insert({
				stat: "strength",
				charId: id,
				parent: {
					id: featureId,
					collection: "Features",
					group: "stat",
				},
				operation: "base",
				value: 10,
				enabled: true,
			});
			Effects.insert({
				stat: "dexterity",
				charId: id,
				parent: {
					id: featureId,
					collection: "Features",
					group: "stat",
				},
				operation: "base",
				value: 10,
				enabled: true,
			});
			Effects.insert({
				stat: "constitution",
				charId: id,
				parent: {
					id: featureId,
					collection: "Features",
					group: "stat",
				},
				operation: "base",
				value: 10,
				enabled: true,
			});
			Effects.insert({
				stat: "intelligence",
				charId: id,
				parent: {
					id: featureId,
					collection: "Features",
					group: "stat",
				},
				operation: "base",
				value: 10,
				enabled: true,
			});
			Effects.insert({
				stat: "wisdom",
				charId: id,
				parent: {
					id: featureId,
					collection: "Features",
					group: "stat",
				},
				operation: "base",
				value: 10,
				enabled: true,
			});
			Effects.insert({
				stat: "charisma",
				charId: id,
				parent: {
					id: featureId,
					collection: "Features",
					group: "stat",
				},
				operation: "base",
				value: 10,
				enabled: true,
			});
			Router.go("characterSheet", {_id: id});
		});
	}
});
