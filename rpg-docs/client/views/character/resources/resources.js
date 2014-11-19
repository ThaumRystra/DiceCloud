Template.resources.helpers({
	hasSlots: function(){
		var slots = 0;
		for(var i = 1; i < 9; i++){
			var attribute = this.attributes["level"+i+"SpellSlots"]
			if(attribute.base != 0) return true;
			if(attribute.add.length != 0) return true;
		}
	},
	hasKi: function(){
		var slots = 0;
			var attribute = this.attributes.ki;
			if(attribute.base != 0) return true;
			if(attribute.add.length != 0) return true;
	},
	hasSorceryPoints: function(){
		var slots = 0;
			var attribute = this.attributes.sorceryPoints;
			if(attribute.base != 0) return true;
			if(attribute.add.length != 0) return true;
	},
	hasRages: function(){
		var slots = 0;
			var attribute = this.attributes.rages;
			if(attribute.base != 0) return true;
			if(attribute.add.length != 0) return true;
	},
	slotSummary: function(){
		var slots = "";
		for(var i = 1; i < 9; i++){
			if (i > 0) slots += " "
			slots += this.attributeValue(this.attributes["level"+i+"SpellSlots"]);
		}
		return slots;
	}
});