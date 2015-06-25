Template.healthCard.helpers({
	tempHitPoints: function(){
		return TemporaryHitPoints.find({charId: this._id});
	},
	showDeathSave: function(){
		return Characters.calculate.attributeValue(this._id, "hitPoints") <= 0;
	},
	deathSaveObject: function(){
		var char = Characters.findOne(this._id, {fields: {deathSave: 1}});
		return char && char.deathSave;
	},
	failIcon: function(num){
		if (num <= this.fail) return "radio-button-on";
		else return "radio-button-off";
	},
	passIcon: function(num){
		if (num <= this.pass) return "radio-button-on";
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
		var multipliers = [
			{name: "Acid",        value: Characters.calculate.attributeValue(this._id, "acidMultiplier")},
			{name: "Bludgeoning", value: Characters.calculate.attributeValue(this._id, "bludgeoningMultiplier")},
			{name: "Cold",        value: Characters.calculate.attributeValue(this._id, "coldMultiplier")},
			{name: "Fire",        value: Characters.calculate.attributeValue(this._id, "fireMultiplier")},
			{name: "Force",       value: Characters.calculate.attributeValue(this._id, "forceMultiplier")},
			{name: "Lightning",   value: Characters.calculate.attributeValue(this._id, "lightningMultiplier")},
			{name: "Necrotic",    value: Characters.calculate.attributeValue(this._id, "necroticMultiplier")},
			{name: "Piercing",    value: Characters.calculate.attributeValue(this._id, "piercingMultiplier")},
			{name: "Poison",      value: Characters.calculate.attributeValue(this._id, "poisonMultiplier")},
			{name: "Psychic",     value: Characters.calculate.attributeValue(this._id, "psychicMultiplier")},
			{name: "Radiant",     value: Characters.calculate.attributeValue(this._id, "radiantMultiplier")},
			{name: "Slashing",    value: Characters.calculate.attributeValue(this._id, "slashingMultiplier")},
			{name: "Thunder",     value: Characters.calculate.attributeValue(this._id, "thunderMultiplier")},
		];
		multipliers = _.groupBy(multipliers, "value");
		return {
			"immunities": multipliers["0"] || [],
			"resistances": multipliers["0.5"] || [],
			"weaknesses": multipliers["2"] || [],
		};
	},
});

Template.healthCard.events({
	"change #hitPointSlider": function(event){
		var value = event.currentTarget.value;
		var base = Characters.calculate.attributeBase(this._id, "hitPoints")
		var adjustment = value - base;
		Characters.update(this._id, {$set: {"hitPoints.adjustment": adjustment}});
		//reset the death saves if we are gaining HP
		if (value > 0)
			Characters.update(
				this._id,
				{$set: {
					"deathSave.pass": 0,
					"deathSave.fail": 0,
					"deathSave.stable": false,
				}}
			);
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
			data: {charId: this._id},
		});
	},
	"tap .failBubble": function(event){
		if (event.currentTarget.disabled) return;
		var char = Template.parentData();
		if (event.currentTarget.icon === "radio-button-off"){
			Characters.update(char._id, {$set: {"deathSave.fail": this.fail + 1}});
		} else {
			Characters.update(char._id, {$set: {"deathSave.fail": this.fail - 1}});
		}
	},
	"tap .passBubble": function(event){
		if (event.currentTarget.disabled) return;
		var char = Template.parentData();
		if (event.currentTarget.icon === "radio-button-off"){
			Characters.update(char._id, {$set: {"deathSave.pass": this.pass + 1}});
		} else {
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
	},
});
