Schemas.SerialisedCharacter = new SimpleSchema({
	character:	{ type: Schemas.Character },
	"character._id": { type: String, regEx: SimpleSchema.RegEx.Id }, //_id is not included in the default Character schema
	
	elements:	{ type: Object },

	"elements.actions":					{ type: [Schemas.Action] },
	"elements.actions.$._id":			{ type: String, regEx: SimpleSchema.RegEx.Id },

	"elements.attacks":					{ type: [Schemas.Attack] },
	"elements.attacks.$._id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.attacks.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id }, //parents also aren't included in the default schemas
	"elements.attacks.$.parent.collection": 		{ type:String, allowedValues: ["Actions", "Attacks", "Buffs", "Classes", "Characters", "Containers", "Effects", "Experiences", "Features", "Items", "Notes", "Proficiencies", "SpellLists", "Spells", "TemporaryHitPoints"] },
	"elements.attacks.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.attacks.$.parent.group":				{ type: String, optional: true },
	"elements.attacks.$.removedWith":				{ type: String, optional: true, regEx: SimpleSchema.RegEx.Id },
	

	"elements.buffs":					{ type: [Schemas.Buff] },
	"elements.buffs.$._id":				{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.buffs.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.buffs.$.parent.collection": 			{ type:String, allowedValues: ["Actions", "Attacks", "Buffs", "Classes", "Characters", "Containers", "Effects", "Experiences", "Features", "Items", "Notes", "Proficiencies", "SpellLists", "Spells", "TemporaryHitPoints"] },
	"elements.buffs.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.buffs.$.parent.group":				{ type: String, optional: true },
	"elements.buffs.$.removedWith":					{ type: String, optional: true, regEx: SimpleSchema.RegEx.Id },

	"elements.classes":					{ type: [Schemas.Class] },
	"elements.classes.$._id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.classes.$.createdAt":		{ type: String }, //it's normally a date, but having this is simpler
	
	"elements.containers":				{ type: [Schemas.Container] },
	"elements.containers.$._id":		{ type: String, regEx: SimpleSchema.RegEx.Id },
	
	"elements.effects":					{ type: [Schemas.Effect] },
	"elements.effects.$._id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.effects.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.effects.$.parent.collection": 		{ type:String, allowedValues: ["Actions", "Attacks", "Buffs", "Classes", "Characters", "Containers", "Effects", "Experiences", "Features", "Items", "Notes", "Proficiencies", "SpellLists", "Spells", "TemporaryHitPoints"] },
	"elements.effects.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.effects.$.parent.group":				{ type: String, optional: true },
	"elements.effects.$.removedWith":				{ type: String, optional: true, regEx: SimpleSchema.RegEx.Id },

	"elements.experiences":				{ type: [Schemas.Experience] },
	"elements.experiences.$._id":		{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.experiences.$.dateAdded":	{ type: String }, //it's normally a date, but having this is simpler
	
	"elements.features":				{ type: [Schemas.Feature] },
	"elements.features.$._id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	
	"elements.items":					{ type: [Schemas.Item] },
	"elements.items.$._id":				{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.items.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.items.$.parent.collection": 			{ type:String, allowedValues: ["Actions", "Attacks", "Buffs", "Classes", "Characters", "Containers", "Effects", "Experiences", "Features", "Items", "Notes", "Proficiencies", "SpellLists", "Spells", "TemporaryHitPoints"] },
	"elements.items.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.items.$.parent.group":				{ type: String, optional: true },
	"elements.items.$.removedWith":					{ type: String, optional: true, regEx: SimpleSchema.RegEx.Id },
	
	"elements.notes":					{ type: [Schemas.Note] },
	"elements.notes.$._id":				{ type: String, regEx: SimpleSchema.RegEx.Id },
	
	"elements.proficiencies":			{ type: [Schemas.Proficiency] },
	"elements.proficiencies.$._id":		{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.proficiencies.$.parent.id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.proficiencies.$.parent.collection": 	{ type:String, allowedValues: ["Actions", "Attacks", "Buffs", "Classes", "Characters", "Containers", "Effects", "Experiences", "Features", "Items", "Notes", "Proficiencies", "SpellLists", "Spells", "TemporaryHitPoints"] },
	"elements.proficiencies.$.parent.id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.proficiencies.$.parent.group":		{ type: String, optional: true },
	"elements.proficiencies.$.removedWith":			{ type: String, optional: true, regEx: SimpleSchema.RegEx.Id },

	"elements.spellLists":				{ type: [Schemas.SpellLists] },
	"elements.spellLists.$._id":		{ type: String, regEx: SimpleSchema.RegEx.Id },
	
	"elements.spells":					{ type: [Schemas.Spell] },
	"elements.spells.$._id":			{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.spells.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.spells.$.parent.collection": 			{ type:String, allowedValues: ["Actions", "Attacks", "Buffs", "Classes", "Characters", "Containers", "Effects", "Experiences", "Features", "Items", "Notes", "Proficiencies", "SpellLists", "Spells", "TemporaryHitPoints"] },
	"elements.spells.$.parent.id":					{ type: String, regEx: SimpleSchema.RegEx.Id },
	"elements.spells.$.parent.group":				{ type: String, optional: true },
	"elements.spells.$.removedWith":				{ type: String, optional: true, regEx: SimpleSchema.RegEx.Id },
	
	"elements.temporaryHitPoints":		{ type: [Schemas.TemporaryHitPoints] },
	"elements.temporaryHitPoints.$._id":{type:  String, regEx: SimpleSchema.RegEx.Id},
	"elements.temporaryHitPoints.$.dateAdded":{ type: String }, //it's normally a date, but having this is simpler
});