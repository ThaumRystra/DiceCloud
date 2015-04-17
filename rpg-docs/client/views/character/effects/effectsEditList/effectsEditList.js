Template.effectsEditList.helpers({
	effects: function(){
		var cursor = Effects.find({"parent.id": this.parentId, "parent.collection": this.parentCollection});
		return cursor;
	}
});

Template.effectsEditList.events({
	"tap #addEffectButton": function(){
		if ( !_.isBoolean(this.enabled) ) {
			this.enabled = true;
		}
		Effects.insert({
			name: this.name,
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection
			},
			operation: "add",
			enabled: this.enabled
		});
	},
});