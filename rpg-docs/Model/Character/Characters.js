//set up the collection for characters
Characters = new Mongo.Collection("characters");

Schemas.Character = new SimpleSchema({
	//strings
	name:         {type: String, defaultValue: "", trim: false},
	alignment:    {type: String, defaultValue: "", trim: false},
	gender:       {type: String, defaultValue: "", trim: false},
	race:         {type: String, defaultValue: "", trim: false},
	description:  {type: String, defaultValue: "", trim: false},
	personality:  {type: String, defaultValue: "", trim: false},
	ideals:       {type: String, defaultValue: "", trim: false},
	bonds:        {type: String, defaultValue: "", trim: false},
	flaws:        {type: String, defaultValue: "", trim: false},
	backstory:    {type: String, defaultValue: "", trim: false},

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
	owner:   {type: String, regEx: SimpleSchema.RegEx.Id},
	readers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: []},
	writers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: []},
	color:   {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
	//TODO add per-character settings
	"settings.experiencesInc": {type: Number, defaultValue: 20}, //how many experiences to load at a time in XP table
});

Characters.attachSchema(Schemas.Character);

var attributeBase = function(charId, statName){
	check(statName, String);
	var effects = Effects.find(
		{charId: charId, stat: statName, enabled: true}
	).fetch();
	effects = _.groupBy(effects, "operation");
	var value = _.contains(DAMAGE_MULTIPLIERS, statName) ? 1 : 0;

	//start with the highest base value
	_.each(effects.base, function(effect){
		var efv = evaluateEffect(charId, effect);
		if (efv > value){
			value = efv;
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
		value = value > min ? value : min;
	});

	//ensure value is <= all maxes
	_.each(effects.max, function(effect){
		var max = evaluateEffect(charId, effect);
		value = value < max ? value : max;
	});
	return value;
};

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
	//returns the value of a field
	fieldValue : function(fieldName){
		if (!Schemas.Character.schema(fieldName)){
			throw new Meteor.Error(
				"Field not found",
				"Character's schema does not contain a field called: " + fieldName
			);
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

	attributeBase: preventLoop(function(attributeName){
		var charId = this._id;
		//base value
		return attributeBase(charId, attributeName);
	}),

	skillMod: preventLoop(function(skillName){
		var charId = this._id;
		var skill = this.getField(skillName);
		//get the final value of the ability score
		var ability = this.attributeValue(skill.ability);

		//base modifier
		var mod = +getMod(ability);

		//multiply proficiency bonus by largest value in proficiency array
		var prof = this.proficiency(skillName);

		//add multiplied proficiency bonus to modifier
		mod += prof * this.attributeValue("proficiencyBonus");

		//apply all effects
		var rawEffects = Effects.find(
			{charId: charId, stat: skillName, enabled: true}
		).fetch();
		var effects = _.groupBy(rawEffects, "operation");
		_.forEach(effects.add, function(effect){
			mod += evaluateEffect(charId, effect);
		});
		_.forEach(effects.mul, function(effect){
			mod *= evaluateEffect(charId, effect);
		});
		_.forEach(effects.min, function(effect){
			var min = evaluateEffect(charId, effect);
			mod = mod > min ? mod : min;
		});
		_.forEach(effects.max, function(effect){
			var max = evaluateEffect(charId, effect);
			mod = mod < max ? mod : max;
		});
		return signedString(mod);
	}),

	proficiency: function(skillName){
		var charId = this._id;
		//return largest value in proficiency array
		var prof = 0;
		Proficiencies.find(
			{charId: charId, name: skillName, enabled: true}
		).forEach(function(proficiency){
			var newProf = proficiency.value;
			if (newProf > prof){
				prof = newProf;
			}
		});
		return prof;
	},

	passiveSkill: function(skillName){
		if (_.isString(skillName)){
			var skill = this.getField(skillName);
		}
		var charId = this._id;
		var mod = +this.skillMod(skillName);
		var value = 10 + mod;
		Effects.find(
			{charId: charId, stat: skillName, enabled: true, operation: "passiveAdd"}
		).forEach(function(effect){
			value += evaluateEffect(charId, effect);
		});
		return value;
		//TODO decide whether (dis)advantage gives (-)+5 to passive checks
	},

	advantage: function(skillName){
		var charId = this._id;
		var advantage = Effects.find(
			{charId: charId, stat: skillName, enabled: true, operation: "advantage"}
		).count();
		var disadvantage = Effects.find(
			{charId: charId, stat: skillName, enabled: true, operation: "disadvantage"}
		).count();
		if (advantage && !disadvantage) return 1;
		if (disadvantage && !advantage) return -1;
		return 0;
	},

	abilityMod: function(attribute){
		return signedString(getMod(this.attributeValue(attribute)));
	},

	passiveAbility: function(attribute){
		var mod = +getMod(this.attributeValue(attribute));
		return 10 + mod;
	},

	xpLevel: function(){
		var xp = this.experience();
		for (var i = 0; i < 19; i++){
			if (xp < XP_TABLE[i]){
				return i;
			}
		}
		if (xp > 355000) return 20;
		return 0;
	},

	level: function(){
		var level = 0;
		Classes.find({charId: this._id}).forEach(function(cls){
			level += cls.level;
		});
		return level;
	},

	experience: function(){
		var xp = 0;
		Experiences.find(
			{charId: this._id},
			{fields: {value: 1}}
		).forEach(function(e){
			xp += e.value;
		});
		return xp;
	},
});

//clean up all data related to that character before removing it
Characters.after.remove(function(userId, character) {
	if (Meteor.isServer){
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
	}
});

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
