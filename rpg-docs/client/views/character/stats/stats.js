Template.stats.events({
	"tap .statCard": function(event, instance){
		var charId = instance.data._id;
		if(this.isSkill){
			GlobalUI.setDetail({
				template: "skillDialog",
				data:     {name: this.name, skillName: this.stat, charId: charId},
				heroId:   charId + this.stat
			});
		} else {
			GlobalUI.setDetail({
				template: "attributeDialog",
				data:     {name: this.name, statName: this.stat, charId: charId},
				heroId:   charId + this.stat
			});
		}
	},
	"tap .skillRow": function(event, instance){
		var skill = this.skill;
		var charId = instance.data._id;
		GlobalUI.setDetail({
				template: "skillDialog",
				data:     {name: this.name, skillName: skill, charId: charId},
				heroId:   charId + skill
			});
	}
});

Template.stats.helpers({

});
