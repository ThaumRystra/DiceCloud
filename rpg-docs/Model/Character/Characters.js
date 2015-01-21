//set up the collection for characters
Characters = new Meteor.Collection("characters");

Schemas.Character = new SimpleSchema({
	//strings
	name:       { type: String, defaultValue: "", trim: false},
	alignment:  { type: String, defaultValue: "", trim: false},
	gender:     { type: String, defaultValue: "", trim: false},
	race:       { type: String, defaultValue: "", trim: false},
	description:{ type: String, defaultValue: "", trim: false},
	personality:{ type: String, defaultValue: "", trim: false},
	ideals:     { type: String, defaultValue: "", trim: false},
	bonds:      { type: String, defaultValue: "", trim: false},
	flaws:      { type: String, defaultValue: "", trim: false},
	backstory:  { type: String, defaultValue: "", trim: false},
	notes:      { type: String, defaultValue: "", trim: false},

	//attributes
	//ability scores
	strength:     {type: Schemas.Attribute},
	dexterity:    {type: Schemas.Attribute},
	constitution: {type: Schemas.Attribute},
	intelligence: {type: Schemas.Attribute},
	wisdom:       {type: Schemas.Attribute},
	charisma:     {type: Schemas.Attribute},

	//stats
	hitPoints:    {type: Schemas.Attribute},
	"hitPoints.effects": {
		type: [Schemas.Effect],
		defaultValue: [
			{name: "Constitution modifier for each level", calculation: "level * constitutionMod", operation: "add", type: "inate"}
		]
	},
	experience:   {type: Schemas.Attribute},
	proficiencyBonus:	{type: Schemas.Attribute},
	"proficiencyBonus.effects": {
		type: [Schemas.Effect],
		defaultValue: [
			{name: "Proficiency bonus by level", calculation: "floor(level / 4 + 1.75)", operation: "add", type: "inate"}
		]
	},
	speed:        {type: Schemas.Attribute},
	weight:       {type: Schemas.Attribute},
	age:          {type: Schemas.Attribute},
	ageRate:      {type: Schemas.Attribute},
	armor:        {type: Schemas.Attribute},
	"armor.effects": {
		type: [Schemas.Effect],
		defaultValue: [
			{name: "Dexterity Modifier", calculation: "dexterityArmor", operation: "add", type: "inate"}
		]
	},

	//resources
	level1SpellSlots: {type: Schemas.Attribute},
	level2SpellSlots: {type: Schemas.Attribute},
	level3SpellSlots: {type: Schemas.Attribute},
	level4SpellSlots: {type: Schemas.Attribute},
	level5SpellSlots: {type: Schemas.Attribute},
	level6SpellSlots: {type: Schemas.Attribute},
	level7SpellSlots: {type: Schemas.Attribute},
	level8SpellSlots: {type: Schemas.Attribute},
	level9SpellSlots: {type: Schemas.Attribute},
	ki:               {type: Schemas.Attribute},
	sorceryPoints:    {type: Schemas.Attribute},
	rages:            {type: Schemas.Attribute},
	superiorityDice:  {type: Schemas.Attribute},
	expertiseDice:    {type: Schemas.Attribute},

	//specific features
	rageDamage:       {type: Schemas.Attribute},

	//hit dice
	d6HitDice:        {type: Schemas.Attribute},
	d8HitDice:        {type: Schemas.Attribute},
	d10HitDice:       {type: Schemas.Attribute},
	d12HitDice:       {type: Schemas.Attribute},

	//vulnerabilities
	acidMultiplier:        {type: Schemas.Vulnerability},
	bludgeoningMultiplier: {type: Schemas.Vulnerability},
	coldMultiplier:        {type: Schemas.Vulnerability},
	fireMultiplier:        {type: Schemas.Vulnerability},
	forceMultiplier:       {type: Schemas.Vulnerability},
	lightningMultiplier:   {type: Schemas.Vulnerability},
	necroticMultiplier:    {type: Schemas.Vulnerability},
	piercingMultiplier:    {type: Schemas.Vulnerability},
	poisonMultiplier:      {type: Schemas.Vulnerability},
	psychicMultiplier:     {type: Schemas.Vulnerability},
	radiantMultiplier:     {type: Schemas.Vulnerability},
	slashingMultiplier:    {type: Schemas.Vulnerability},
	thunderMultiplier:     {type: Schemas.Vulnerability},


	//skills
	//saves
	strengthSave:    {type: Schemas.Skill},
	"strengthSave.ability":     { type: String, defaultValue: "strength" },

	dexteritySave:	 {type: Schemas.Skill},
	"dexteritySave.ability":    { type: String, defaultValue: "dexterity" },

	constitutionSave:{type: Schemas.Skill},
	"constitutionSave.ability": { type: String, defaultValue: "constitution" },

	intelligenceSave:{type: Schemas.Skill},
	"intelligenceSave.ability":	{ type: String, defaultValue: "intelligence" },

	wisdomSave:      {type: Schemas.Skill},
	"wisdomSave.ability":       { type: String, defaultValue: "wisdom" },

	charismaSave:    {type: Schemas.Skill},
	"charismaSave.ability":     { type: String, defaultValue: "charisma" },


	//skill skills
	acrobatics: 	{type: Schemas.Skill},
	"acrobatics.ability": 		{ type: String, defaultValue: "dexterity" },

	animalHandling: {type: Schemas.Skill},
	"animalHandling.ability":	{ type: String, defaultValue: "wisdom" },

	arcana: 		{type: Schemas.Skill},
	"arcana.ability": 			{ type: String, defaultValue: "intelligence" },

	athletics: 		{type: Schemas.Skill},
	"athletics.ability": 		{ type: String, defaultValue: "strength" },

	deception: 		{type: Schemas.Skill},
	"deception.ability": 		{ type: String, defaultValue: "charisma" },

	history: 		{type: Schemas.Skill},
	"history.ability": 			{ type: String, defaultValue: "intelligence" },

	insight:		{type: Schemas.Skill},
	"insight.ability":			{ type: String, defaultValue: "wisdom" },

	intimidation:	{type: Schemas.Skill},
	"intimidation.ability":		{ type: String, defaultValue: "charisma" },

	investigation:	{type: Schemas.Skill},
	"investigation.ability":	{ type: String, defaultValue: "intelligence" },

	medicine:		{type: Schemas.Skill},
	"medicine.ability": 		{ type: String, defaultValue: "wisdom" },

	nature:			{type: Schemas.Skill},
	"nature.ability": 			{ type: String, defaultValue: "intelligence" },

	perception:		{type: Schemas.Skill},
	"perception.ability": 		{ type: String, defaultValue: "wisdom" },

	performance:	{type: Schemas.Skill},
	"performance.ability": 		{ type: String, defaultValue: "charisma" },

	persuasion: 	{type: Schemas.Skill},
	"persuasion.ability": 		{ type: String, defaultValue: "charisma" },

	religion:		{type: Schemas.Skill},
	"religion.ability": 		{ type: String, defaultValue: "intelligence" },

	sleightOfHand:	{type: Schemas.Skill},
	"sleightOfHand.ability":	{ type: String, defaultValue: "dexterity" },

	stealth:		{type: Schemas.Skill},
	"stealth.ability": 			{ type: String, defaultValue: "dexterity" },

	survival:		{type: Schemas.Skill},
	"survival.ability": 		{ type: String, defaultValue: "wisdom" },


	//Mechanical Skills
	initiative: 		{type: Schemas.Skill},
	"initiative.ability":		{ type: String, defaultValue: "dexterity" },

	strengthAttack:		{type: Schemas.Skill},
	"strengthAttack.ability": 	{type: String,defaultValue: "strength"},

	dexterityAttack:	{type: Schemas.Skill},
	"dexterityAttack.ability":	{ type: String, defaultValue: "dexterity" },

	constitutionAttack:	{type: Schemas.Skill},
	"constitutionAttack.ability":{ type: String, defaultValue: "constitution" },

	intelligenceAttack:	{type: Schemas.Skill},
	"intelligenceAttack.ability":{ type: String, defaultValue: "intelligence" },

	wisdomAttack:		{type: Schemas.Skill},
	"wisdomAttack.ability":		{ type: String, defaultValue: "wisdom" },

	charismaAttack:		{type: Schemas.Skill},
	"charismaAttack.ability":	{ type: String, defaultValue: "charisma" },

	rangedAttack:		{type: Schemas.Skill},
	"rangedAttack.ability":		{ type: String, defaultValue: "dexterity" },

	dexterityArmor:		{type: Schemas.Skill},
	"dexterityArmor.ability":	{ type: String, defaultValue: "dexterity" },

	//proficiencies
	weaponsProficiencies: {
		type: [Schemas.Proficiency],
		defaultValue: []
	},
	toolsProficiencies: {
		type: [Schemas.Proficiency],
		defaultValue: []
	},
	languages: {
		type: [Schemas.Proficiency],
		defaultValue: []
	},

	//mechanics
	actions:		{ type: [Schemas.Action], defaultValue: []},
	deathSave:		{ type: Schemas.DeathSave },
	time:			{ type: Number, min: 0, decimal: true, defaultValue: 0},
	initiativeOrder:{ type: Number, min: 0, max: 1, decimal: true, defaultValue: 0},
	buffs:			{ type: [Schemas.Buff], defaultValue: []}
	//TODO add permission stuff for owner, readers and writers
	//TODO add per-character settings
});

Characters.attachSchema(Schemas.Character);

//reactively remove expired effects
//TODO broken with the move from expirations -> buffs
//TODO fix by finding every buff whose expiry is >= current time, pull those buffs
Characters.find({},{fields: {time: 1, expirations: 1, features: 1}}).observe({
	changed: function(character){
		var currentTime = character.time;
		_.each(character.expirations, function(expiration){
			if(expiration.expiry <= currentTime){
				var charId = character._id;
				var stat = expiration.stat;
				//remove expired effects
				_.each(expiration.effectIds, function(effectId){
					pullEffect(charId, stat, effectId);
				});
				//disable expired features
				_.each(expiration.featureIds, function(featureId){
					var feature = Characters.findOne({_id: charId, "features._id": featureId}, {fields: {features: 1}}).features[0];
					feature.enabled = false;
					Characters.update({_id: charId, "features._id": featureId}, {$set: {"features.$": feature}});
				});
				pullExpiry(charId, expiration._id);
			}
		});
	}
});

var attributeBase = function(charId, attribute){
	var effects = _.groupBy(attribute.effects, "operation");
	var value = 0;
	
	//start with the highest base value
	_.each(effects.base, function(effect){
		var efv = evaluateEffect(charId, effect)
		if (effect.value > value){
			value = effect.value;
		}
	});
	
	//add all the add values
	_.each(effects.add, function(effect){
		value += evaluateEffect(charId, effect);
	});
	
	//multiply all the mul values
	_.each(effects.mul, function(effect){
		value *= evaluateEffect(charId, effect);
	});
	
	//ensure value is >= all mins
	_.each(effects.min, function(effect){
		var min = evaluateEffect(charId, effect);
		value = value > min? value : min;
	});
	
	//ensure value is <= all maxes
	_.each(effects.max, function(effect){
		var max = evaluateEffect(charId, effect);
		value = value < max? value : max;
	});
	return value;
}

//functions and calculated values.
//These functions can only rely on this._id since no other
//field is likely to be attached to all returned characters
Characters.helpers({
	//returns the value stored in the field requested
	//will set up dependencies on just that field
	getField : function(fieldName){
		var fieldSelector = {};
		fieldSelector[fieldName] = 1;
		var char = Characters.findOne(this._id, {fields: fieldSelector});
		var field = char[fieldName];
		if(field === undefined){
			throw new Meteor.Error("getField failed", 
								   "getField could not find field " + fieldName + " in character "+ char._id);
		}
		return field;
	},
	//returns the value of a field
	fieldValue : function(fieldName){
		if(!Schemas.Character.schema(fieldName)){
			throw new Meteor.Error("Field not found", "Character's schema does not contain a field called: " + fieldName);
		}
		//duck typing to get the right value function
		//.ability implies skill
		if (Schemas.Character.schema(fieldName + ".ability")){
			return this.skillMod(fieldName);
		}
		//adjustment implies attribute
		if (Schemas.Character.schema(fieldName + ".adjustment")){
			return this.attributeValue(fieldName);
		}
		//fall back to just returning the field itself
		return this.getField(fieldName);
	},

	attributeValue: function(attributeName){
		var charId = this._id;
		var attribute = this.getField(attributeName);
		//base value
		var value = this.attributeBase(attributeName);
		//plus adjustment
		value += attribute.adjustment;
		return value;
	},

	attributeBase: (function(){
		//store a private array of attributes we've visited without returning
		//if we try to visit the same attribute twice before resolving its value
		//we are in a dependency loop and need to GTFO
		var visitedAttributes = [];
		return function(attributeName){
			check(attributeName, String);
			//we're still evaluating this attribute, must be in a loop
			if(_.contains(visitedAttributes, attributeName)) {
				console.log("dependency loop detected");
				return NaN;
			}
			//push this attribute to the list of visited attributes
			//we can't visit it again unless it returns first
			visitedAttributes.push(attributeName);
			try{
				var charId = this._id;
				var attribute = this.getField(attributeName);
				//base value
				var value = attributeBase(charId, attribute);
			}finally{
				//this attribute returns or fails, pull it from the array, we may visit it again safely
				visitedAttributes = _.without(visitedAttributes, attributeName);
			}
			return value;
		}
	})(),

	skillMod: (function(){
		//store a private array of skills we've visited without returning
		//if we try to visit the same skill twice before resolving its value
		//we are in a dependency loop and need to GTFO
		var visitedSkills = [];
		return function(skillName){
			check(skillName, String);
			//we're still evaluating this attribute, must be in a loop
			if(_.contains(visitedSkills, skillName)) {
				console.log("dependency loop detected");
				return NaN;
			}
			//push this skill to the list of visited skills
			//we can't visit it again unless it returns first
			visitedSkills.push(skillName);
			try{
				var charId = this._id;
				skill = this.getField(skillName);
				//get the final value of the ability score
				var ability = this.attributeValue(skill.ability);

				//base modifier
				var mod = +getMod(ability)

				//multiply proficiency bonus by largest value in proficiency array
				var prof = this.proficiency(skill);

				//add multiplied proficiency bonus to modifier
				mod += prof * this.attributeValue("proficiencyBonus");

				_.each(skill.effects, function(effect){
					switch(effect.operation) {
						case "add":
							mod += evaluateEffect(charId, effect);
							break;
						case "mul":
							mod *= evaluateEffect(charId, effect);
							break;
						case "min":
							var min = evaluateEffect(charId, effect);
							mod = mod > min? mod : min;
							break;
						case "max":
							var max = evaluateEffect(charId, effect);
							mod = mod < max? mod : max;
							break;
					}
				});
			} finally{
				//this skill returns or fails, pull it from the array
				visitedSkills = _.without(visitedSkills, skillName);
			}
			return signedString(mod);
		}
	})(),

	proficiency: function(skill){
		if (_.isString(skill)){
			skill = this.getField(skill);
		}
		var charId = this._id;
		//return largest value in proficiency array
		var prof = 0;
		_.each(skill.effects, function(effect){
			if(effect.operation === "proficiency"){
				var newProf = evaluateEffect(charId, effect);
				if (newProf > prof){
					prof = newProf;
				}
			}
		});
		return prof;
	},

	passiveSkill: function(skillName){
		if (_.isString(skillName)){
			var skill = this.getField(skillName);
		}
		var charId = this._id
		var mod = +this.skillMod(skillName);
		var value = 10 + mod;
		_.each(skill.effects, function(effect){
			if(effect.operation === "passiveAdd"){
				value += evaluateEffect(charId, effect);
			}
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
		var xp = this.attributeValue("experience");
		var xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
					   85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000,
					   305000, 355000];
		for(var i = 0; i < 19; i++){
			if(xp < xpTable[i]){
				return i;
			}
		};
		if(xp > 355000) return 20;
		return 0;
	}
});
