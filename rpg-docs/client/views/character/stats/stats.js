Template.stats.helpers({
	buffs: function() {
		return Buffs.find({charId: this._id}, {sort: {name: 1}});
	}
})

Template.stats.events({
	"click .stat-card": function(event, instance){
		var charId = instance.data._id;
		if (this.isSkill){
			pushDialogStack({
				template: "skillDialog",
				data: {
					name: this.name,
					skillName: this.stat,
					charId: charId,
					color: this.color,
				},
				element: event.currentTarget,
			});
		} else {
			pushDialogStack({
				template: "attributeDialog",
				data: {
					name: this.name,
					statName: this.stat,
					charId: charId,
					color: this.color,
				},
				element: event.currentTarget,
			});
		}
	},
	"click .ability-mini-card": function(event, instance){
		var charId = Template.parentData()._id;
		var template = "attributeDialog";
		if (this.ability === "strength") template = "strengthDialog";
		pushDialogStack({
			template: template,
			data: {
				name: this.title,
				statName: this.ability,
				charId: charId,
				color: this.color,
			},
			element: event.currentTarget,
		});
	},
	"tap .skill-row": function(event, instance){
		var skill = this.skill;
		var charId = instance.data._id;
		pushDialogStack({
			template: "skillDialog",
			data: {
				name: this.name,
				skillName: skill,
				charId: charId,
			},
			element: event.currentTarget,
		});
	},
	"tap .hitPointTitle": function(event, instance) {
		pushDialogStack({
			template: "attributeDialog",
			data: {
				name: "Hit Points",
				statName: "hitPoints",
				charId: this._id,
				color: "green",
			},
			element: event.currentTarget.parentElement.parentElement,
		});
	},
});
