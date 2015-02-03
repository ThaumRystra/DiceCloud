Template.skillRow.helpers({
	profIcon: function(){
		var prof = Template.parentData(1).proficiency(this.skill);
		if(prof > 0 && prof < 1) return "image:brightness-2";
		if(prof === 1) return "image:brightness-1";
		if(prof > 1) return "av:album";
		return "radio-button-off";
	},
	failSkill: function(){
		var charId = Template.parentData(1)._id;
		return Effects.find({charId: charId, stat: this.skill, enabled: true, operation: "fail"}).count();
	},
	advantage: function(){
		var advantage = Template.parentData(1).advantage(this.skill);
		if(advantage > 0) return "advantage";
		if(advantage < 0) return "disadvantage";
	},
	conditionalCount: function(){
		var charId = Template.parentData(1)._id;
		return Effects.find({charId: charId, stat: this.skill, enabled: true, operation: "conditional"}).count();
	}
});