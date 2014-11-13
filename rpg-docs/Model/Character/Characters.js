//set up the collection for characters
Characters = new Meteor.Collection("characters");

Schemas.Character = new SimpleSchema({
	strings: 		{ type: Schemas.Strings },
	attributes: 	{ type: Schemas.Attributes },
	skills: 		{ type: Schemas.Skills },
	vulerabilities:	{ type: Schemas.Vulnerabilities },
	proficiencies:	{ type: Schemas.Proficiencies },
	features:		{ type: [Schemas.Feature]},
	time:			{ type: Number, min: 0, decimal: true},
	initiativeOrder:{ type: Number, min: 0, max: 1, decimal: true}
	//TODO add permission stuff for owner, readers and writers
	//TODO hit dice
});

Characters.attachSchema(Schemas.Character);

//react to time changing
Characters.find({fields: {time: 1}}).observeChanges({
	changed: function(id, fields){
		var currentTime = fields.time;
		console.log(id + "time changed to " + currentTime)
		var features = Characters.findOne(id, { fields: {features: 1} }).features;
		_.each(features, function(feature){
			//expired features, if no expiry time is set, this is always false
			if(feature.expires >= currentTime){
				//remove buffs
				pullBuffs(id, feature.buffs);
				//disable feature
				Characters.update(
					{_id: id, "features._id": feature.id},
					{$set: {"features.$.enabled": false}}
				);
			}
		});
	}
});

//functions and calculated values
Characters.helpers({ 
	attributeValue: function(attribute){
		if (attribute === undefined) return;
		//base value
		var value = attribute.base;

		//add all values in add array
		for(var i = 0, l = attribute.add.length; i < l; i++){
			var add = pop(attribute.add[i].value, this);
			value += add ;
		}

		//multiply all values in mul array
		for(var i = 0, l = attribute.mul.length; i < l; i++){
			var mul = pop(attribute.mul[i], this);
			value *= mul;
		}

		//largest min
		for(var i = 0, l = attribute.min.length; i < l; i++){
			var min = pop(attribute.min[i], this);
			value = value > min? value : min;
		}

		//smallest max
		for(var i = 0, l = attribute.max.length; i < l; i++){
			var max = pop(attribute.max[i], this);
			value = value < max? value : max;
		}

		return value;
	},

	proficiency: function(skill){
		//return largest value in proficiency array
		var prof = 0;
		for(var i = 0, l = skill.proficiency.length; i < l; i++){
			var newProf = pop(skill.proficiency[i].value, this);
			if (newProf > prof){
				prof = newProf;
			}
		}
		return prof;
	},

	skillMod: function(skill){
		if(skill === undefined){ 
			console.log("Cannot get skillMod of undefined");
			return;
		}
		//get the final value of the ability score
		var ability = this.attributeValue(this.attributes[skill.ability]);

		//base modifier
		var mod = +getMod(ability)

		//multiply proficiency bonus by largest value in proficiency array
		var prof = this.proficiency(skill);

		//add multiplied proficiency bonus to modifier
		mod += prof * this.attributeValue(this.attributes.proficiencyBonus);

		//add all values in add array
		for(var i = 0, l = skill.add.length; i < l; i++){
			mod += pop(skill.add[i].value, this);
		}

		//multiply all values in mul array
		for(var i = 0, l = skill.mul.length; i < l; i++){
			mod *= pop(skill.mul[i].value, this);
		}

		//largest min
		for(var i = 0, l = skill.min.length; i < l; i++){
			var min = pop(skill.min[i], this);
			mod = mod > min? mod : min;
		}

		//smallest max
		for(var i = 0, l = skill.max.length; i < l; i++){
			var max = pop(skill.max[i], this);
			mod = mod < max? mod : max;
		}

		return signedString(mod);
	},

	passiveSkill: function(skill){
		var mod = +this.skillMod(skill);
		var value = 10 + mod;
		for(var i = 0, l = skill.passiveAdd.length; i < l; i++){
			value += pop(skill.passiveAdd[i].value, this);
		}
		return value;
		//TODO decide whether (dis)advantage gives (-)+5 to passive checks
	},

	abilityMod: function(attribute){
		return signedString(getMod(this.attributeValue(attribute)));
	},

	passiveAbility: function(attribute){
		var mod = +getMod(this.attributeValue(attribute));
		return 10 + mod;
	},

	level: function(){
		var xp = this.attributeValue(this.attributes.experience);
		var xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
					   85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000,
					   305000, 355000];
		_.each(xpTable, function(value, i){
			if(xp < value){
				return i;
			}
		});
		return 20;
	}
});

getMod = function(score){
	return Math.floor((score-10)/2);
}

signedString = function(number){
	return number > 0? "+" + number : "" + number;
}