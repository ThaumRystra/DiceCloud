Template.healthCard.helpers({
	tempHitPoints: function(){
		return TemporaryHitPoints.find({charId: this._id});
	},
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
		return !(num === this.fail || num - 1 === this.fail);
	},
	passDisabled: function(num){
		return !(num === this.pass || num - 1 === this.pass);
	},
	dead: function(){
		return this.fail >= 3;
	},
	multipliers: function(){
		var char = Characters.findOne(this._id, {fields: {_id: 1} });
		var multipliers = [
			{name: "Acid",        value: char.attributeValue("acidMultiplier", 1)},
			{name: "Bludgeoning", value: char.attributeValue("bludgeoningMultiplier", 1)},
			{name: "Cold",        value: char.attributeValue("coldMultiplier", 1)},
			{name: "Fire",        value: char.attributeValue("fireMultiplier", 1)},
			{name: "Force",       value: char.attributeValue("forceMultiplier", 1)},
			{name: "Lightning",   value: char.attributeValue("lightningMultiplier", 1)},
			{name: "Necrotic",    value: char.attributeValue("necroticMultiplier", 1)},
			{name: "Piercing",    value: char.attributeValue("piercingMultiplier", 1)},
			{name: "Poison",      value: char.attributeValue("poisonMultiplier", 1)},
			{name: "Psychic",     value: char.attributeValue("psychicMultiplier", 1)},
			{name: "Radiant",     value: char.attributeValue("radiantMultiplier", 1)},
			{name: "Slashing",    value: char.attributeValue("slashingMultiplier", 1)},
			{name: "Thunder",     value: char.attributeValue("thunderMultiplier", 1)}
		];
		multipliers = _.groupBy(multipliers, "value");
		return {
			"immunities": multipliers["0"] || [],
			"resistances": multipliers["0.5"] || [],
			"weaknesses": multipliers["2"] || []
		};
	}
});

Template.healthCard.events({
	"change #hitPointSlider": function(event){
		var value = event.currentTarget.value;
		var adjustment = value - this.attributeBase("hitPoints");
		Characters.update(this._id, {$set: {"hitPoints.adjustment": adjustment}});
	},
	"change .tempHitPointSlider": function(event){
		var value = event.currentTarget.value;
		var used = this.maximum - value;
		TemporaryHitPoints.update(this._id, {$set: {"used": used}});
	},
	"tap .deleteTHP": function(event){
		TemporaryHitPoints.remove(this._id);
	},
	"tap #addTempHP": function(event){
		GlobalUI.showDialog({
				template: "addTHPDialog",
				data: {charId: this._id}
			});
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
