Template.effectsViewList.helpers({
	effects: function(){
		return Effects.find({"parent.id": this.parentId, charId: this.charId}, {fields: {parent: 0}});
	}
});
