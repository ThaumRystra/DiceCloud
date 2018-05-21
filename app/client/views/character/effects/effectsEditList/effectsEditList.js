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
		var effects = Effects.find(selector).fetch();
		return _.sortBy(effects, effect => statOrder[effect.stat] || 999);
	}
});

Template.effectsEditList.events({
	"tap #addEffectButton": function(event, instance){
		if (!_.isBoolean(this.enabled)) {
			this.enabled = true;
		}
		const effectId = Effects.insert({
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
		pushDialogStack({
			template: "effectEdit",
			data: {id: effectId},
			element: event.currentTarget,
			returnElement: () => instance.find(`tr.effect[data-id='${effectId}']`),
		});
	},
	"tap .edit-effect": function(event, template){
		pushDialogStack({
			template: "effectEdit",
			data: {id: this._id},
			element: event.currentTarget.parentElement.parentElement,
		});
	},
});
