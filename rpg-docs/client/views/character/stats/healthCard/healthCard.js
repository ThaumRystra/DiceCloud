Template.healthCard.helpers({
	showDeathSave: function(){
		return this.attributeValue("hitPoints") <= 0;
	},
	deathSaveObject: function(){
		var char = Characters.findOne(this._id, {fields: {deathSave: 1}});
		return char && char.deathSave;
	},
	failIcon: function(num){
		if(num <= this.fail) return "radio-button-on";
		else return "radio-button-off";
	},
	passIcon: function(num){
		if(num <= this.pass) return "radio-button-on";
		else return "radio-button-off";
	},
	failDisabled: function(num){
		return !(num === this.fail || num - 1 === this.fail)
	},
	passDisabled: function(num){
		return !(num === this.pass || num - 1 === this.pass)
	},
	dead: function(char){
		return this.fail >= 3;
	}
})

Template.healthCard.events({
	"change #hitPointSlider": function(event){
		var value = event.currentTarget.value;
		var adjustment = value - this.attributeBase("hitPoints");
		Characters.update(this._id, {$set: {"hitPoints.adjustment": adjustment}});
	},
	"tap .failBubble": function(event){
		if(event.currentTarget.disabled) return;
		var char = Template.parentData();
		if(event.currentTarget.icon === "radio-button-off"){
			Characters.update(char._id, {$set: {"deathSave.fail": this.fail + 1}});
		} else{
			Characters.update(char._id, {$set: {"deathSave.fail": this.fail - 1}});
		}
	},
	"tap .passBubble": function(event){
		if(event.currentTarget.disabled) return;
		var char = Template.parentData();
		if(event.currentTarget.icon === "radio-button-off"){
			Characters.update(char._id, {$set: {"deathSave.pass": this.pass + 1}});
		} else{
			Characters.update(char._id, {$set: {"deathSave.pass": this.pass - 1}});
		}
	},
	"tap #stableButton": function(event){
		var char = Template.parentData();
		Characters.update(char._id, {$set: {"deathSave.stable": false}});
	},
	"tap #unstableButton": function(event){
		var char = Template.parentData();
		Characters.update(char._id, {$set: {"deathSave.stable": true}});
	}
});
