const currentId = () => Template.currentData()._id;

// Use binding to ensure max is always set before value to prevent value clamping poorly
Template.healthCard.binding({
	"#hitPointSlider": {
		max: () => Characters.calculate.attributeBase(currentId() , "hitPoints"),
		value: () => Characters.calculate.attributeValue(currentId() , "hitPoints"),
	},
});

// Reset the old value between characters so that we don't get red health lost
// bar when changing character
Template.healthCard.onRendered(function(){
	let oldId = Template.currentData()._id;
	this.autorun(() => {
		const id = Template.currentData()._id;
		if (oldId !== id){
			this.find("#hitPointSlider").resetOldValue();
			var thpSlider = this.find("#temporaryHitPointSlider");
			thpSlider && thpSlider.resetOldValue();
			oldId = id;
		}
	});
});

Template.healthCard.helpers({
	extraHitPoints: function(){
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
		if (num <= this.fail) return "radio-button-checked";
		else return "radio-button-unchecked";
	},
	passIcon: function(num){
		if (num <= this.pass) return "radio-button-checked";
		else return "radio-button-unchecked";
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
		// jscs:disable maximumLineLength
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
		// jscs:enable maximumLineLength
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
		var base = Characters.calculate.attributeBase(this._id, "hitPoints");
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
	"change #temporaryHitPointSlider": function(event){ //this is the actual THP stat
		var value = event.currentTarget.value;
		var base = Characters.calculate.attributeBase(this._id, "tempHP");
		var adjustment = value - base;
		Characters.update(this._id, {$set: {"tempHP.adjustment": adjustment}});
	},
	"change .extraHitPointSlider": function(event){ //this is the extra bars
		var value = event.currentTarget.value;
		var used = this.maximum - value;
		TemporaryHitPoints.update(this._id, {$set: {"used": used}});
	},
	"click .deleteEHP": function(event){
		TemporaryHitPoints.remove(this._id);
	},
	"click #addExtraHP": function(event){
		pushDialogStack({
			template: "addEHPDialog",
			data: {charId: this._id},
			element: event.currentTarget.parentElement,
		});
	},
	"click .failBubble": function(event){
		if (event.currentTarget.disabled) return;
		var char = Template.parentData();
		if (event.currentTarget.icon === "radio-button-unchecked"){
			Characters.update(char._id, {$set: {"deathSave.fail": this.fail + 1}});
		} else {
			Characters.update(char._id, {$set: {"deathSave.fail": this.fail - 1}});
		}
	},
	"click .passBubble": function(event){
		if (event.currentTarget.disabled) return;
		var char = Template.parentData();
		if (event.currentTarget.icon === "radio-button-unchecked"){
			Characters.update(char._id, {$set: {"deathSave.pass": this.pass + 1}});
		} else {
			Characters.update(char._id, {$set: {"deathSave.pass": this.pass - 1}});
		}
	},
	"click #stableButton": function(event){
		var char = Characters.findOne(Template.parentData()._id, {
			fields: {deathSave: 1}
		});
		Characters.update(char._id, {
			$set: {
				"deathSave.stable": !char.deathSave.stable
			}
		});
	},
});
