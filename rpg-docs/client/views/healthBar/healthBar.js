Template.healthBar.helpers({
	hpPercent: function(){
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
		return 100*(currentHp/(currentHp - damage));
	},
	
	maxHp: function(){
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
		return currentHp - damage;
	}
});