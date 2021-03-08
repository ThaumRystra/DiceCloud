Template.effectsViewList.helpers({
	effects: function(){
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
		};
		if (this.parentGroup){
			selector["parent.group"] = this.parentGroup;
		}
		let effects =  Effects.find(selector, {
			fields: {parent: 0},
		}).fetch();
		return _.sortBy(effects, effect => {
			if (!statOrder[effect.stat] && statOrder[effect.stat] !== 0) { return 999; }
			return statOrder[effect.stat]
		});
	}
});
