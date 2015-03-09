Template.effectsEditList.helpers({
	effects: function(){
		var cursor = Effects.find({sourceId: this.sourceId, type: this.type});
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
			sourceId: this.sourceId,
			operation: "add",
			type: this.type,
			enabled: this.enabled
		});
	},
});