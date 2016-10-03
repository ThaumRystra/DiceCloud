Template.effectsEditList.helpers({
	effects: function(){
		var selector = {
			"parent.id": this.parentId,
			"parent.collection": this.parentCollection,
			"charId": this.charId,
		};
		if (this.parentGroup){
			selector["parent.group"] = this.parentGroup;
		}
		var cursor = Effects.find(selector);
		return cursor;
	}
});

Template.effectsEditList.events({
	"tap #addEffectButton": function(){
		if (!_.isBoolean(this.enabled)) {
			this.enabled = true;
		}
		Effects.insert({
			name: this.name,
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection,
				group: this.parentGroup,
			},
			operation: "add",
			enabled: this.enabled,
		});
	},
});
