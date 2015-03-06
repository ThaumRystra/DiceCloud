Template.effectsViewList.helpers({
	effects: function(){
		if(this.sourceId){
			return Effects.find({sourceId: this.sourceId, type: this.type, charId: this.charId}, {fields: {sourceId: 0}});
		} else if(this.stat){
			return Effects.find({charId: this.charId, stat: this.stat});
		}

	}
});
