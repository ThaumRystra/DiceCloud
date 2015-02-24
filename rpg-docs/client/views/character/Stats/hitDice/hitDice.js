Template.hitDice.helpers({
	cantIncrement: function(){
		return !(this.char.attributeValue(this.name) < this.char.attributeBase(this.name));
	},
	cantDecrement: function(){
		return !(this.char.attributeValue(this.name) > 0);
	}
});

Template.hitDice.events({
	"tap .resourceUp": function(event){
		if(this.char.attributeValue(this.name) < this.char.attributeBase(this.name)){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .resourceDown": function(event){
		if(this.char.attributeValue(this.name) > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	}
});
