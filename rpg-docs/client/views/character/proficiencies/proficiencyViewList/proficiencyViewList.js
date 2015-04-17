Template.proficiencyViewList.helpers({
	proficiencies: function(){
		return Proficiencies.find({"parent.id": this.parentId, charId: this.charId});
	}
});
