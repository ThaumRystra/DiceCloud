Template.attacksViewList.helpers({
	attacks: function () {
		return Attacks.find({
			"parent.id": this.parentId,
			charId: this.charId,
			removed: { $ne: true },
		});
	}
});
