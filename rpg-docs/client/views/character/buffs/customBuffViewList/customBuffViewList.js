Template.customBuffViewList.helpers({
	buffs: function(){
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
		};
		return CustomBuffs.find(selector);
	}
});
