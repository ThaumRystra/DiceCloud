// Don't just export a constant, because deep nested objects could be changed
// by code that requires it. Exporting a function that returns the newly created
// object is a little safer.
export default () => ({
  "attributes": [
    {"name": "Strength",     "variableName": "strength",     "baseValue": 10, "type": "ability"},
    {"name": "Dexterity",    "variableName": "dexterity",    "baseValue": 10, "type": "ability"},
    {"name": "Constitution", "variableName": "constitution", "baseValue": 10, "type": "ability"},
    {"name": "Intelligence", "variableName": "intelligence", "baseValue": 10, "type": "ability"},
    {"name": "Wisdom",       "variableName": "wisdom",       "baseValue": 10, "type": "ability"},
    {"name": "Charisma",     "variableName": "charisma",     "baseValue": 10, "type": "ability"},

  	{"name": "Speed",       "variableName": "speed", "baseValue": 30, "type": "stat"},
  	{"name": "Armor Class", "variableName": "armor", "baseValue": 10, "type": "stat"},

  	{"name":  "d6 Hit Dice", "variableName":  "d6HitDice", "type": "hitDice"},
		{"name":  "d8 Hit Dice", "variableName":  "d8HitDice", "type": "hitDice"},
		{"name": "d10 Hit Dice", "variableName": "d10HitDice", "type": "hitDice"},
		{"name": "d12 Hit Dice", "variableName": "d12HitDice", "type": "hitDice"},


		{"name": "Hit Points",           "variableName": "hitPoints",     "type": "healthBar"},
		{"name": "Temporary Hit Points", "variableName": "tempHitPoints", "type": "healthBar"},

    {"name": "Ki",               "variableName": "ki",              "type": "resource"},
    {"name": "Rages",            "variableName": "rages",           "type": "resource"},
		{"name": "Sourcery Points",  "variableName": "sorceryPoints",   "type": "resource"},
		{"name": "Superiority Dice", "variableName": "superiorityDice", "type": "resource"},
		{"name": "Expertise Dice",   "variableName": "expertiseDice",   "type": "resource"},

		{"name": "Level 1 Spell Slots", "variableName": "level1SpellSlots", "type": "spellSlot"},
		{"name": "Level 2 Spell Slots", "variableName": "level2SpellSlots", "type": "spellSlot"},
		{"name": "Level 3 Spell Slots", "variableName": "level3SpellSlots", "type": "spellSlot"},
		{"name": "Level 4 Spell Slots", "variableName": "level4SpellSlots", "type": "spellSlot"},
		{"name": "Level 5 Spell Slots", "variableName": "level5SpellSlots", "type": "spellSlot"},
		{"name": "Level 6 Spell Slots", "variableName": "level6SpellSlots", "type": "spellSlot"},
		{"name": "Level 7 Spell Slots", "variableName": "level7SpellSlots", "type": "spellSlot"},
		{"name": "Level 8 Spell Slots", "variableName": "level8SpellSlots", "type": "spellSlot"},
		{"name": "Level 9 Spell Slots", "variableName": "level9SpellSlots", "type": "spellSlot"},

    {"name": "Proficiency Bonus", "variableName": "proficiencyBonus", "type": "modifier"},

  	{"name": "Carry Capacity Multiplier", "variableName": "carryMultiplier", "type": "utility", "baseValue": 1},
  	{"name": "Rage Damage",               "variableName": "rageDamage",      "type": "utility"},
  ],

  "skills": [
    {"name": "Acrobatics",      "variableName": "acrobatics",     "ability": "dexterity",    "type":"skill"},
    {"name": "Animal Handling", "variableName": "animalHandling", "ability": "wisdom",       "type":"skill"},
    {"name": "Arcana",          "variableName": "arcana",         "ability": "intelligence", "type":"skill"},
    {"name": "Athletics",       "variableName": "athletics",      "ability": "strength",     "type":"skill"},
    {"name": "Deception",       "variableName": "deception",      "ability": "charisma",     "type":"skill"},
    {"name": "History",         "variableName": "history",        "ability": "intelligence", "type":"skill"},
    {"name": "Insight",         "variableName": "insight",        "ability": "wisdom",       "type":"skill"},
    {"name": "Intimidation",    "variableName": "intimidation",   "ability": "charisma",     "type":"skill"},
    {"name": "Investigation",   "variableName": "investigation",  "ability": "intelligence", "type":"skill"},
    {"name": "Medicine",        "variableName": "medicine",       "ability": "wisdom",       "type":"skill"},
    {"name": "Nature",          "variableName": "nature",         "ability": "intelligence", "type":"skill"},
    {"name": "Perception",      "variableName": "perception",     "ability": "wisdom",       "type":"skill"},
    {"name": "Performance",     "variableName": "performance",    "ability": "charisma",     "type":"skill"},
    {"name": "Persuasion",      "variableName": "persuasion",     "ability": "charisma",     "type":"skill"},
    {"name": "Religion",        "variableName": "religion",       "ability": "intelligence", "type":"skill"},
    {"name": "Sleight of Hand", "variableName": "sleightOfHand",  "ability": "dexterity",    "type":"skill"},
    {"name": "Stealth",         "variableName": "stealth",        "ability": "dexterity",    "type":"skill"},
    {"name": "Survival",        "variableName": "survival",       "ability": "wisdom",       "type":"skill"},

    {"name": "Strength Save",     "variableName": "strengthSave",     "ability": "strength",     "type":"save"},
    {"name": "Dexterity Save",    "variableName": "dexteritySave",    "ability": "dexterity",    "type":"save"},
    {"name": "Constitution Save", "variableName": "constitutionSave", "ability": "constitution", "type":"save"},
    {"name": "Intelligence Save", "variableName": "intelligenceSave", "ability": "intelligence", "type":"save"},
    {"name": "Wisdom Save",       "variableName": "wisdomSave",       "ability": "wisdom",       "type":"save"},
    {"name": "Charisma Save",     "variableName": "charismaSave",     "ability": "charisma",     "type":"save"},

    {"name": "Initiative",     "variableName": "initiative",     "ability": "dexterity",     "type":"check"},
  ],

  "damageMultipliers": [
    {"name": "Acid Multiplier",        "variableName":"acidMultiplier"},
    {"name": "Bludgeoning Multiplier", "variableName":"bludgeoningMultiplier"},
    {"name": "Cold Multiplier",        "variableName":"coldMultiplier"},
    {"name": "Fire Multiplier",        "variableName":"fireMultiplier"},
    {"name": "Force Multiplier",       "variableName":"forceMultiplier"},
    {"name": "Lightning Multiplier",   "variableName":"lightningMultiplier"},
    {"name": "Necrotic Multiplier",    "variableName":"necroticMultiplier"},
    {"name": "Piercing Multiplier",    "variableName":"piercingMultiplier"},
    {"name": "Poison Multiplier",      "variableName":"poisonMultiplier"},
    {"name": "Psychic Multiplier",     "variableName":"psychicMultiplier"},
    {"name": "Radiant Multiplier",     "variableName":"radiantMultiplier"},
    {"name": "Slashing Multiplier",    "variableName":"slashingMultiplier"},
    {"name": "Thunder Multiplier",     "variableName":"thunderMultiplier"},
  ],

  "effects": [
    {
      "name": "Proficiency bonus by level",
      "stat": "proficiencyBonus",
      "operation": "add",
      "calculation": "floor(level / 4 + 1.75)",
      "enabled": true,
    },{
      "name": "Constitution modifier per level",
      "stat": "hitPoints",
      "operation": "add",
      "calculation": "constitutionMod * level",
      "enabled": true,
    },
  ],

  "containers": [
    {
			"name": "Coin Pouch",
			"isCarried": true,
			"description": "A sturdy pouch for coins",
      "items": [
        {
    			"name": "Gold piece",
    			"plural": "Gold pieces",
    			"quantity": 0,
    			"weight": 0.02,
    			"value": 1,
    			"settings": {
    				"showIncrement": true,
    			},
        }, {
    			"name": "Silver piece",
    			"plural": "Silver pieces",
    			"quantity": 0,
    			"weight": 0.02,
    			"value": 0.1,
    			"settings": {
    				"showIncrement": true,
    			},
    		}, {
    			"name": "Copper piece",
    			"plural": "Copper pieces",
    			"quantity": 0,
    			"weight": 0.02,
    			"value": 0.01,
    			"settings": {
    				"showIncrement": true,
    			},
        },
      ],
    },
  ],
});
