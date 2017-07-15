Template.buffViewList.helpers({
	buffs: function(){
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
		};
		if (this.parentGroup){
			selector["parent.group"] = this.parentGroup;
		}
		return Buffs.find(selector);
	}
});
