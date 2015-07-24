//set up the collection for characters
Characters = new Mongo.Collection("characters");

Schemas.Character = new SimpleSchema({
	//strings
	name:         {type: String, defaultValue: "", trim: false, optional: true},
	alignment:    {type: String, defaultValue: "", trim: false, optional: true},
	gender:       {type: String, defaultValue: "", trim: false, optional: true},
	race:         {type: String, defaultValue: "", trim: false, optional: true},
	picture:      {type: String, defaultValue: "", trim: true,  optional: true},
	description:  {type: String, defaultValue: "", trim: false, optional: true},
	personality:  {type: String, defaultValue: "", trim: false, optional: true},
	ideals:       {type: String, defaultValue: "", trim: false, optional: true},
	bonds:        {type: String, defaultValue: "", trim: false, optional: true},
	flaws:        {type: String, defaultValue: "", trim: false, optional: true},
	backstory:    {type: String, defaultValue: "", trim: false, optional: true},

	//attributes
	//ability scores
	strength:         {type: Schemas.Attribute},
	dexterity:        {type: Schemas.Attribute},
	constitution:     {type: Schemas.Attribute},
	intelligence:     {type: Schemas.Attribute},
	wisdom:           {type: Schemas.Attribute},
	charisma:         {type: Schemas.Attribute},

	//stats
	hitPoints:        {type: Schemas.Attribute},
	experience:       {type: Schemas.Attribute},
	proficiencyBonus: {type: Schemas.Attribute},
	speed:            {type: Schemas.Attribute},
	weight:           {type: Schemas.Attribute},
	age:              {type: Schemas.Attribute},
	ageRate:          {type: Schemas.Attribute},
	armor:            {type: Schemas.Attribute},

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
	acidMultiplier:        {type: Schemas.Attribute},
	bludgeoningMultiplier: {type: Schemas.Attribute},
	coldMultiplier:        {type: Schemas.Attribute},
	fireMultiplier:        {type: Schemas.Attribute},
	forceMultiplier:       {type: Schemas.Attribute},
	lightningMultiplier:   {type: Schemas.Attribute},
	necroticMultiplier:    {type: Schemas.Attribute},
	piercingMultiplier:    {type: Schemas.Attribute},
	poisonMultiplier:      {type: Schemas.Attribute},
	psychicMultiplier:     {type: Schemas.Attribute},
	radiantMultiplier:     {type: Schemas.Attribute},
	slashingMultiplier:    {type: Schemas.Attribute},
	thunderMultiplier:     {type: Schemas.Attribute},

	//skills
	//saves
	strengthSave:    {type: Schemas.Skill},
	"strengthSave.ability":     {type: String, defaultValue: "strength"},

	dexteritySave:	 {type: Schemas.Skill},
	"dexteritySave.ability":    {type: String, defaultValue: "dexterity"},

	constitutionSave:{type: Schemas.Skill},
	"constitutionSave.ability": {type: String, defaultValue: "constitution"},

	intelligenceSave:{type: Schemas.Skill},
	"intelligenceSave.ability":	{type: String, defaultValue: "intelligence"},

	wisdomSave:      {type: Schemas.Skill},
	"wisdomSave.ability":       {type: String, defaultValue: "wisdom"},

	charismaSave:    {type: Schemas.Skill},
	"charismaSave.ability":     {type: String, defaultValue: "charisma"},

	//skill skills
	acrobatics:      {type: Schemas.Skill},
	"acrobatics.ability":       {type: String, defaultValue: "dexterity"},

	animalHandling:  {type: Schemas.Skill},
	"animalHandling.ability":   {type: String, defaultValue: "wisdom"},

	arcana:          {type: Schemas.Skill},
	"arcana.ability":           {type: String, defaultValue: "intelligence"},

	athletics:       {type: Schemas.Skill},
	"athletics.ability":        {type: String, defaultValue: "strength"},

	deception:       {type: Schemas.Skill},
	"deception.ability":        {type: String, defaultValue: "charisma"},

	history:        {type: Schemas.Skill},
	"history.ability":          {type: String, defaultValue: "intelligence"},

	insight:        {type: Schemas.Skill},
	"insight.ability":          {type: String, defaultValue: "wisdom"},

	intimidation:   {type: Schemas.Skill},
	"intimidation.ability":		{type: String, defaultValue: "charisma"},

	investigation:	{type: Schemas.Skill},
	"investigation.ability":	{type: String, defaultValue: "intelligence"},

	medicine:		{type: Schemas.Skill},
	"medicine.ability":        {type: String, defaultValue: "wisdom"},

	nature:			{type: Schemas.Skill},
	"nature.ability":          {type: String, defaultValue: "intelligence"},

	perception:		{type: Schemas.Skill},
	"perception.ability":      {type: String, defaultValue: "wisdom"},

	performance:	{type: Schemas.Skill},
	"performance.ability":     {type: String, defaultValue: "charisma"},

	persuasion:     {type: Schemas.Skill},
	"persuasion.ability":      {type: String, defaultValue: "charisma"},

	religion:       {type: Schemas.Skill},
	"religion.ability":        {type: String, defaultValue: "intelligence"},

	sleightOfHand:	{type: Schemas.Skill},
	"sleightOfHand.ability":	{type: String, defaultValue: "dexterity"},

	stealth:		{type: Schemas.Skill},
	"stealth.ability":          {type: String, defaultValue: "dexterity"},

	survival:		{type: Schemas.Skill},
	"survival.ability":         {type: String, defaultValue: "wisdom"},

	//Mechanical Skills
	initiative:      {type: Schemas.Skill},
	"initiative.ability":		{type: String, defaultValue: "dexterity"},

	dexterityArmor:		{type: Schemas.Skill},
	"dexterityArmor.ability":	{type: String, defaultValue: "dexterity"},

	//mechanics
	deathSave:      {type: Schemas.DeathSave},

	//permissions
	party:   {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
	owner:   {type: String, regEx: SimpleSchema.RegEx.Id},
	readers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: []},
	writers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: []},
	color:   {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
	//TODO add per-character settings
	//how many experiences to load at a time in XP table
	"settings.experiencesInc": {type: Number, defaultValue: 20},
	//slowed down by carrying too much?
	"settings.useVariantEncumbrance": {type: Boolean, defaultValue: false},
	"settings.useStandardEncumbrance": {type: Boolean, defaultValue: true},
	//hide spellcasting
	"settings.hideSpellcasting": {type: Boolean, defaultValue: false},
	//show to anyone with link
	"settings.viewPermission": {
		type: String,
		defaultValue: "whitelist",
		allowedValues: ["whitelist", "public"],
	},
});

Characters.attachSchema(Schemas.Character);

var attributeBase = preventLoop(function(charId, statName){
	check(statName, String);
	//if it's a damage multiplier, we treat it specially
	if (_.contains(DAMAGE_MULTIPLIERS, statName)){
		var invulnerabilityCount = Effects.find({
			charId: charId,
			stat: statName,
			enabled: true,
			operation: "mul",
			value: 0,
		}).count();
		if (invulnerabilityCount) return 0;
		var resistCount = Effects.find({
			charId: charId,
			stat: statName,
			enabled: true,
			operation: "mul",
			value: 0.5,
		}).count();
		var vulnCount = Effects.find({
			charId: charId,
			stat: statName,
			enabled: true,
			operation: "mul",
			value: 2,
		}).count();
		if (!resistCount && !vulnCount){
			return 1;
		}  else if (resistCount && !vulnCount){
			return 0.5;
		}  else if (!resistCount && vulnCount){
			return 2;
		} else {
			return 1;
		}
	}
	var value;
	var base = 0;
	var add = 0;
	var mul = 1;
	var min = Number.NEGATIVE_INFINITY;
	var max = Number.POSITIVE_INFINITY;

	Effects.find({
		charId: charId,
		stat: statName,
		enabled: true,
		operation: {$in: ["base", "add", "mul", "min", "max"]},
	}).forEach(function(effect) {
		value = evaluateEffect(charId, effect);
		if (effect.operation === "base"){
			if (value > base) base = value;
		} else if (effect.operation === "add"){
			add += value;
		} else if (effect.operation === "mul"){
			mul *= value;
		} else if (effect.operation === "min"){
			if (value > min) min = value;
		} else if (effect.operation === "max"){
			if (value < max) max = value;
		}
	});

	var result = (base + add) * mul;
	if (result < min) result = min;
	if (result > max) result = max;

	return Math.floor(result);
});

if (Meteor.isClient) {
	Template.registerHelper("characterCalculate", function(func, charId, input) {
		try {
			return Characters.calculate[func](charId, input);
		} catch (e){
			if (!Characters.calculate[func]){
				throw new Error(func + "is not a function name");
			} else {
				throw e;
			}
		}
	});
}

//create a local memoize with a argument concatenating hash function
var memoize = function(f) {
	return Tracker.memoize(f, function() {
		return _.reduce(arguments, function(memo, arg) {
			return memo + arg;
		}, "");
	});
};

//memoize funcitons that have finds and slow loops
Characters.calculate = {
	getField: function(charId, fieldName) {
		var fieldSelector = {};
		fieldSelector[fieldName] = 1;
		var char = Characters.findOne(charId, {fields: fieldSelector});
		var field = char[fieldName];
		if (field === undefined){
			throw new Meteor.Error(
				"getField failed",
				"getField could not find field " +
				fieldName +
				" in character " +
				char._id
			);
		}
		return field;
	},
	fieldValue: function(charId, fieldName) {
		if (!Schemas.Character.schema(fieldName)){
			throw new Meteor.Error(
				"Field not found",
				"Character's schema does not contain a field called: " + fieldName
			);
		}
		//duck typing to get the right value function
		//.ability implies skill
		if (Schemas.Character.schema(fieldName + ".ability")){
			return Characters.calculate.skillMod(charId, fieldName);
		}
		//adjustment implies attribute
		if (Schemas.Character.schema(fieldName + ".adjustment")){
			return Characters.calculate.attributeValue(charId, fieldName);
		}
		//fall back to just returning the field itself
		return Characters.calculate.getField(charId, fieldName);
	},
	attributeValue: memoize(function(charId, attributeName){
		var attribute = Characters.calculate.getField(charId, attributeName);
		//base value
		var value = Characters.calculate.attributeBase(charId, attributeName);
		//plus adjustment
		value += attribute.adjustment;
		return value;
	}),
	attributeBase: memoize(function(charId, attributeName){
		return attributeBase(charId, attributeName);
	}),
	skillMod: memoize(preventLoop(function(charId, skillName){
		var skill = Characters.calculate.getField(charId, skillName);
		//get the final value of the ability score
		var ability = Characters.calculate.attributeValue(charId, skill.ability);

		//base modifier
		var mod = +getMod(ability);

		//multiply proficiency bonus by largest value in proficiency array
		var prof = Characters.calculate.proficiency(charId, skillName);

		//add multiplied proficiency bonus to modifier
		mod += prof * Characters.calculate.attributeValue(charId, "proficiencyBonus");

		//apply all effects
		var value;
		var add = 0;
		var mul = 1;
		var min = Number.NEGATIVE_INFINITY;
		var max = Number.POSITIVE_INFINITY;

		Effects.find({
			charId: charId,
			stat: skillName,
			enabled: true,
			operation: {$in: ["base", "add", "mul", "min", "max"]},
		}).forEach(function(effect) {
			value = evaluateEffect(charId, effect);
			if (effect.operation === "add"){
				add += value;
			} else if (effect.operation === "mul"){
				mul *= value;
			} else if (effect.operation === "min"){
				if (value > min) min = value;
			} else if (effect.operation === "max"){
				if (value < max) max = value;
			}
		});
		var result = (mod + add) * mul;
		if (result < min) result = min;
		if (result > max) result = max;

		return Math.floor(result);
	})),
	proficiency: memoize(function(charId, skillName){
		//return largest value in proficiency array
		var prof = Proficiencies.findOne(
			{charId: charId, name: skillName, enabled: true},
			{sort: {value: -1}}
		);
		return prof && prof.value || 0;
	}),
	passiveSkill: memoize(function(charId, skillName){
		var skill = Characters.calculate.getField(charId, skillName);
		var mod = +Characters.calculate.skillMod(charId, skillName);
		var value = 10 + mod;
		Effects.find(
			{charId: charId, stat: skillName, enabled: true, operation: "passiveAdd"}
		).forEach(function(effect){
			value += evaluateEffect(charId, effect);
		});
		var advantage = Characters.calculate.advantage(charId, skillName);
		value += 5 * advantage;
		return Math.floor(value);
	}),
	advantage: memoize(function(charId, skillName){
		var advantage = Effects.find(
			{charId: charId, stat: skillName, enabled: true, operation: "advantage"}
		).count();
		var disadvantage = Effects.find(
			{charId: charId, stat: skillName, enabled: true, operation: "disadvantage"}
		).count();
		if (advantage && !disadvantage) return 1;
		if (disadvantage && !advantage) return -1;
		return 0;
	}),
	abilityMod: function(charId, attribute){
		return getMod(
			Characters.calculate.attributeValue(charId, attribute)
		);
	},
	passiveAbility: function(charId, attribute){
		var mod = +getMod(Characters.calculate.attributeValue(charId, attribute));
		return 10 + mod;
	},
	xpLevel: function(charId){
		var xp = Characters.calculate.experience(charId);
		for (var i = 0; i < 19; i++){
			if (xp < XP_TABLE[i]){
				return i;
			}
		}
		if (xp > 355000) return 20;
		return 0;
	},
	level: memoize(function(charId){
		var level = 0;
		Classes.find({charId: charId}).forEach(function(cls){
			level += cls.level;
		});
		return level;
	}),
	experience: memoize(function(charId){
		var xp = 0;
		Experiences.find(
			{charId: charId},
			{fields: {value: 1}}
		).forEach(function(e){
			xp += e.value;
		});
		return xp;
	}),
};

var depreciated = function() {
	//var err = new Error("this function has been depreciated");
	var name = "";
	if (Template.instance()){
		name = Template.instance().view.name;
	}
	var logString = "this function has been depreciated \n";
	if (name){
		logString += "View: " + name + "\n\n";
	}
	//logString += err.stack + "\n\n---------------------\n\n";
	console.log(logString);
};

//functions and calculated values.
//These functions can only rely on this._id since no other
//field is likely to be attached to all returned characters
Characters.helpers({
	//returns the value stored in the field requested
	//will set up dependencies on just that field
	getField : function(fieldName){
		depreciated();
		return Characters.calculate.getField(this._id, fieldName);
	},
	//returns the value of a field
	fieldValue : function(fieldName){
		depreciated();
		return Characters.calculate.fieldValue(this._id, fieldName);
	},
	attributeValue: function(attributeName){
		depreciated();
		return Characters.calculate.attributeValue(this._id, attributeName);
	},
	attributeBase: function(attributeName){
		depreciated();
		return Characters.calculate.attributeBase(this._id, attributeName);
	},
	skillMod: function(skillName){
		depreciated();
		return Characters.calculate.skillMod(this._id, skillName);
	},
	proficiency: function(skillName){
		depreciated();
		return Characters.calculate.proficiency(this._id, skillName);
	},
	passiveSkill: function(skillName){
		depreciated();
		return Characters.calculate.passiveSkill(this._id, skillName);
	},
	advantage: function(skillName){
		depreciated();
		return Characters.calculate.advantage(this._id, skillName);
	},
	abilityMod: function(attribute){
		depreciated();
		return Characters.calculate.abilityMod(this._id, attribute);
	},
	passiveAbility: function(attribute){
		depreciated();
		return Characters.calculate.passiveAbility(this._id, attribute);
	},
	xpLevel: function(){
		depreciated();
		return Characters.calculate.xpLevel(this._id);
	},
	level: function(){
		depreciated();
		return Characters.calculate.level(this._id);
	},
	experience: function(){
		depreciated();
		return Characters.calculate.experience(this._id);
	},
});

//clean up all data related to that character before removing it
if (Meteor.isServer){
	Characters.after.remove(function(userId, character) {
		Actions       .remove({charId: character._id});
		Attacks       .remove({charId: character._id});
		Buffs         .remove({charId: character._id});
		Classes       .remove({charId: character._id});
		Effects       .remove({charId: character._id});
		Experiences   .remove({charId: character._id});
		Features      .remove({charId: character._id});
		Notes         .remove({charId: character._id});
		Proficiencies .remove({charId: character._id});
		SpellLists    .remove({charId: character._id});
		Items         .remove({charId: character._id});
		Containers    .remove({charId: character._id});
	});
}

Characters.allow({
	insert: function(userId, doc) {
		// the user must be logged in, and the document must be owned by the user
		return (userId && doc.owner === userId);
	},
	update: function(userId, doc, fields, modifier) {
		// can only change documents you have write access to
		return doc.owner === userId ||
			_.contains(doc.writers, userId);
	},
	remove: function(userId, doc) {
		// can only remove your own documents
		return doc.owner === userId;
	},
	fetch: ["owner", "writers"],
});

Characters.deny({
	update: function(userId, docs, fields, modifier) {
		// can't change owners
		return _.contains(fields, "owner");
	}
});
