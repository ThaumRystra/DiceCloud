Template.proficiencyViewList.helpers({
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
