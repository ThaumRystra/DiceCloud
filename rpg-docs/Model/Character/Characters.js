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
	initiativeOrder:{ type: Number, min: 0, max: 1, decimal: true},
	expirations:	{ type: [Schemas.Expiration]}
	//TODO add permission stuff for owner, readers and writers
	//TODO hit dice
	//TODO spells
});

Characters.attachSchema(Schemas.Character);

//reactively remove expired effects
//this can be optimised a lot once clients can do projections
Characters.find({},{fields: {time: 1, expirations: 1}}).observe({
	changed: function(character, oldCharacter){
		var currentTime = character.time;
		_.each(character.expirations, function(expiration){
			if(expiration.expiry <= currentTime){
				pullEffect(character._id, expiration.stat, expiration.effectId);
				pullExpiry(character._id, expiration._id);
			}
		})
	}
});

//functions and calculated values
Characters.helpers({ 
	attributeValue: function(attribute){
		if (attribute === undefined) return;
		//base value
		var value = attribute.base;

		//add all values in add array
		_.each(attribute.add, function(effect){
			value += pop(effect.value, this)
		});

		//multiply all values in mul array
		_.each(attribute.mul, function(effect){
			value *= pop(effect.value, this)
		});

		//largest min
		_.each(attribute.min, function(effect){
			var min = pop(effect.value, this);
			value = value > min? value : min;
		});

		//smallest max
		_.each(attribute.max, function(effect){
			var max = pop(effect.value, this);
			value = value < max? value : max;
		});

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
		_.each(skill.add, function(effect){
			mod += pop(effect.value, this)
		});

		//multiply all values in mul array
		_.each(skill.mul, function(effect){
			mod *= pop(effect.value, this)
		});

		//largest min
		_.each(skill.min, function(effect){
			var min = pop(effect.value, this);
			mod = mod > min? mod : min;
		});

		//smallest max
		_.each(skill.max, function(effect){
			var max = pop(effect.value, this);
			mod = mod < max? mod : max;
		});

		return signedString(mod);
	},

	passiveSkill: function(skill){
		var mod = +this.skillMod(skill);
		var value = 10 + mod;
		_.each(skill.passiveAdd, function(effect){
			value += pop(effect.value, this);
		});
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