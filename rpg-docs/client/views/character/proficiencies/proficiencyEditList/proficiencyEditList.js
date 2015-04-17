Template.proficiencyEditList.helpers({
	proficiencies: function(){
		var cursor = Proficiencies.find({"parent.id": this.parentId, "parent.collection": this.parentCollection});
		return cursor;
	}
});

Template.proficiencyEditList.events({
	"tap #addProficiencyButton": function(){
		if ( !_.isBoolean(this.enabled) ) {
			this.enabled = true;
		}
		Proficiencies.insert({
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection
			},
			enabled: this.enabled,
			value: 1,
			type: "skill",
		});
	},
});
