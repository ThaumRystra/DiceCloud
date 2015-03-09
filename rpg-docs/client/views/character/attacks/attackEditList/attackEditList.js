Template.attackEditList.helpers({
	attacks: function(){
		var cursor = Attacks.find({sourceId: this.sourceId, type: this.type});
		return cursor;
	}
});

Template.attackEditList.events({
	"tap #addAttackButton": function(){
		if ( !_.isBoolean(this.enabled) ) {
			this.enabled = true;
		}
		Attacks.insert({
			name: this.name,
			charId: this.charId,
			sourceId: this.sourceId,
			type: this.type,
			enabled: this.enabled
		});
	},
});
