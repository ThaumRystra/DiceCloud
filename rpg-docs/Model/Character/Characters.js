//set up the collection for characters
Characters = new Meteor.Collection("characters");

Schemas.Character = new SimpleSchema({
	strings: 		{ type: Schemas.Strings },
	attributes: 	{ type: Schemas.Attributes },
	skills: 		{ type: Schemas.Skills },
	vulerabilities:	{ type: Schemas.Vulnerabilities },
	proficiencies:	{ type: Schemas.Proficiencies }

	//TODO add permission stuff for owner, readers and writers
	//TODO hit dice
});

Characters.attachSchema(Schemas.Character);

//functions and calculated values go here
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
	
	pushEffects : function(effectName, effectsArray){
		throw "this function is not implemented correctly for buffs->effects"
		//check that the arguments are of the right for
		check(effectName, String);
		check(effectsArray, [{ _id: String, stat: String, value: Number}]);

		for(var i = 0; i < effectsArray.length; i++){
			var effect = effectsArray[i];

			//check if the character exists with the field we are changing
			if(pop(effect.stat, this) !== undefined){
				var newEffect = {};
				newEffect[effect.stat] = {_id: effect.id, name: effectName, value: effect.value};
				//update the field
				Characters.update(this._id, {$push: newEffect});
			}
		}
	},

	pullEffects : function(effectsArray){
		throw "this function is not implemented correctly for buffs->effects"
		//check that the arguments are of the right form
		check(effectsArray, [{ _id: String, stat: String, value: Number}]);

		for(var i = 0; i < effectsArray.length; i++){
			var effect = effectsArray[i];

			//check if the character exists with the field we are changing
			if(pop(effect.stat, this) !== undefined){
				var effectToPull = {};
				effectToPull[effect.stat] = {_id: effect.id};
				//update the field
				Characters.update(this._id, {$pull: effectToPull});
			}
		}
	},
	
	level: function(){
		var xp = this.attributeValue(this.attributes.experience);
		var xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
					  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000,
					  305000, 355000];
		for(var i = 0, l = xpTable.length; i < l; i++){
			if(xp < xpTable[i]){
				return i;
			}
		}
		return 20;
	}
});

getMod = function(score){
	return Math.floor((score-10)/2);
}

signedString = function(number){
	return number > 0? "+" + number : "" + number;
}