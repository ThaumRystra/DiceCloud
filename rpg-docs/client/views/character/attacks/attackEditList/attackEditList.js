Template.attackEditList.helpers({
	attacks: function() {
		var cursor = Attacks.find({"parent.id": this.parentId, charId: this.charId});
		return cursor;
	}
});

Template.attackEditList.events({
	"tap #addAttackButton": function() {
		Attacks.insert({
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection
			}
		});
	},
});
