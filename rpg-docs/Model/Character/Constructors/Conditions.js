DamageTypes = [
	"acid", "bludgeoning", "cold", "fire", "force",
	"lightning", "necrotic", "piercing", "poison", "psychic",
	"radiant", "slashing", "thunder"
]
Conditions = {};

Conditions.Blinded = {
	description: ["a blinded creature can't see and automatically fails any ability check that requires sight.",
				  "Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage."]
}

Conditions.Charmed = {
	description: ["A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects",
				  "The charmer has advantage on any ability check to interact socially with the creature."]
}

Conditions.Deafened = {
	description: ["A deafened creature can't hear and automatically fails any ability check that requires hearing"]
}

Conditions.Frightened = {
	description: []
}

Conditions.Grappled = {
	description: [
		"A grappled creature's speed becomes 0, and it can't benefit from any bonuses to its speed",
		"The condition ends if the grappler is incapacitated",
		"The conditions also ends if if an effect removes the\
grappled creature from the reach of the grappler or grappling\
effect, such as when a creature is hurled\
away by the thunderwave spell."
	],
	effects: [
		{stat: "attributes.speed.max", value: 0}
	]
}

Conditions.Incapacitated = {
	effects: [
		{stat: "attributes.actions.max", value: 0},
		{stat: "attributes.reactions.max", value: 0},
		{stat: "attributes.bonusActions.max", value: 0}
	]
}

Conditions.Invisible = {

}

Conditions.Paralyzed = {
	//implies incapacitated
	effects: [
		{stat: "skills.strengthSave.fail", value: 1},
		{stat: "skills.dexteritySave.fail", value: 1},
		{stat: "attributes.speed.max", value: 0}
	]
}
_.extend(Conditions.Paralyzed, Conditions.Incapacitated);

Conditions.Petrified = {

	effects: [
		{stat: "attributes.weight.mul", value: 10},
		{stat: "attributes.ageRate.max", value: 0},
		{stat: "attributes.ageRate.min", value: 0},
		{stat: "skills.strengthSave.fail", value: 1},
		{stat: "skills.dexteritySave.fail", value: 1},
		{stat: "attributes.speed.max", value: 0}
	]
}
for(var i = 0, l = DamageTypes.length; i < l; i++){
	var str = "vulnerability." + DamageTypes[i] + ".mul"
	Conditions.Petrified.effects.push({stat: str, value: 0.5});
}
_.extend(Conditions.Petrified, Conditions.Incapacitated);

Conditions.Poisoned = {
	description: []
}

Conditions.Prone = {
	description: [],
	effects: [
		{stat: "skills.strengthAttack.disadvantage", value: 1},
		{stat: "skills.dexterityAttack.disadvantage", value: 1},
		{stat: "skills.rangedAttack.disadvantage", value: 1}
	]
}

Conditions.Restrained = {
	effects: [
		{stat: "attributes.speed.max", value: 0}
	]
}

Conditions.Stunned = {
	//implies incapacitated
	effects: [
		{stat: "attributes.speed.max", value: 0},
		{stat: "skills.strengthSave.fail", value: 1},
		{stat: "skills.dexteritySave.fail", value: 1}
	]
}
_.extend(Conditions.Stunned, Conditions.Incapacitated);

Conditions.Unconscious = {
	//implies incapacitated
	//implies prone
	effects: [
		{stat: "attributes.speed.max", value: 0},
		{stat: "skills.strengthSave.fail", value: 1},
		{stat: "skills.dexteritySave.fail", value: 1}
	]
}
_.extend(Conditions.Unconscious, Conditions.Incapacitated);
_.extend(Conditions.Unconscious, Conditions.Prone);