Template.effectsViewList.helpers({
	effects: function(){
		if(this.parentId){
			return Effects.find({"parent.id": this.parentId, charId: this.charId}, {fields: {parent: 0}});
		} else if(this.stat){
			return Effects.find({charId: this.charId, stat: this.stat});
		}

	}
});
