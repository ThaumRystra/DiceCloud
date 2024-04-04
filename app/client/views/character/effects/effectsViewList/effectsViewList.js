Template.effectsViewList.helpers({
	effects: function () {
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
			removed: { $ne: true },
		};
		if (this.parentGroup) {
			selector["parent.group"] = this.parentGroup;
		}
		let effects = Effects.find(selector, {
			fields: { parent: 0 },
		}).fetch();
		return _.sortBy(effects, effect => statOrder[effect.stat] || 999);
	}
});
