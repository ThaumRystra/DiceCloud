Template.customBuffViewList.helpers({
	buffs: function () {
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
			removed: { $ne: true },
		};
		return CustomBuffs.find(selector);
	}
});
