Template.stats.events({
	"tap .statCard": function(event, instance){
		//TODO reimplement this when the dialog is nice
		return;
		if(this.isSkill){
			var charId = instance.data._id;
			GlobalUI.setDetail({
				template: "skillDialog",
				data:     {name: this.name, skillName: this.stat, charId: charId},
				heroId:   charId + this.stat
			});
		}
	},
	"tap .skillRow": function(event, instance){
		//TODO reimplement this when the dialog is nice
		return;
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
