Template.carryDialog.helpers({
	carriedWeight: function () {
		var weight = 0;
		Containers.find(
			{
				charId: this.charId,
				isCarried: true,
				removed: { $ne: true },
			}
		).forEach(function (container) {
			weight += container.totalWeight();
		});
		Items.find(
			{
				charId: this.charId,
				"parent.id": this.charId,
				removed: { $ne: true },
			},
			{ fields: { weight: 1, quantity: 1 } }
		).forEach(function (item) {
			weight += item.totalWeight();
		});
		return weight;
	},
	color: function () {
		if (this.color) return this.color + " white-text";
	},
});
