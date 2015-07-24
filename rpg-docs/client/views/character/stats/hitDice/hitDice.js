Template.hitDice.helpers({
	cantIncrement: function(){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		return value >= base || !canEditCharacter(this.char._id);
	},
	cantDecrement: function(){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		return value <= 0 || !canEditCharacter(this.char._id);
	},
	conMod: function(){
		return signedString(
			Characters.calculate.abilityMod(this.char._id, "constitution")
		);
	},
});

Template.hitDice.events({
	"tap .resourceUp": function(event){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		if (value < base){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .resourceDown": function(event){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		if (value > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .right": function() {
		var charId = Template.parentData()._id;
		var title = "d" + this.diceNum + " Hit Dice";
		GlobalUI.setDetail({
			template: "attributeDialog",
			data:     {
				name: title,
				statName: this.name,
				charId: charId,
				color: "green",
			},
			heroId:   charId + this.name,
		});
	},
});
