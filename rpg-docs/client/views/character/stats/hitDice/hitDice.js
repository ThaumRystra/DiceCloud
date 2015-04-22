Template.hitDice.helpers({
	cantIncrement: function(){
		var valueSmallerThanBase = this.char.attributeValue(this.name) <
			this.char.attributeBase(this.name);
		return !valueSmallerThanBase;
	},
	cantDecrement: function(){
		var valuePositive = this.char.attributeValue(this.name) > 0;
		return !valuePositive;
	},
});

Template.hitDice.events({
	"tap .resourceUp": function(event){
		if (this.char.attributeValue(this.name) < this.char.attributeBase(this.name)){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .resourceDown": function(event){
		if (this.char.attributeValue(this.name) > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
});
