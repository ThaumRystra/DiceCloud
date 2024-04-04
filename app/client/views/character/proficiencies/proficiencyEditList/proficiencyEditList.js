Template.proficiencyEditList.helpers({
	proficiencies: function () {
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
			removed: { $ne: true },
		};
		if (this.parentGroup) {
			selector["parent.group"] = this.parentGroup;
		}
		return Proficiencies.find(selector);
	}
});

Template.proficiencyEditList.events({
	"tap #addProficiencyButton": function () {
		if (!_.isBoolean(this.enabled)) {
			this.enabled = true;
		}
		Proficiencies.insert({
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection,
				group: this.parentGroup,
			},
			enabled: this.enabled,
			value: 1,
			type: "skill",
		});
	},
});
