Template.effectsViewList.helpers({
	effects: function(){
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId
		};
		if (this.parentGroup){
			selector["parent.group"] = this.parentGroup;
		}
		return Effects.find(selector, {fields: {parent: 0}});
	}
});
