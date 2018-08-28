DEFAULT_CHARACTER_STATS = {
  "attributes": {
  	"ability": [
  		"Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"
  	],
  	"stat": [
  		"Speed",
  		{"name": "Armor Class", "variableName": "armor"},
  	],
  	"hitDice": [
  		{"name":  "d6 Hit Dice", "variableName":  "d6HitDice"},
  		{"name":  "d8 Hit Dice", "variableName":  "d8HitDice"},
  		{"name": "d10 Hit Dice", "variableName": "d10HitDice"},
  		{"name": "d12 Hit Dice", "variableName": "d12HitDice"},
  	],
  	"healthBar": [
  		{"name": "Hit Points", "variableName": "hitPoints"},
  		{"name": "Temporary Hit Points", "variableName": "tempHitPoints"},
  	],
  	"resource": [
  		"Ki", "Rages",
  		{"name": "Sourcery Points", "variableName": "sorceryPoints"},
  		{"name": "Superiority Dice", "variableName": "superiorityDice"},
  		{"name": "Expertise Dice", "variableName": "expertiseDice"},
  	],
  	"spellSlot": [
  		{"name": "Level 1 Spell Slots", "variableName": "level1SpellSlots"},
  		{"name": "Level 2 Spell Slots", "variableName": "level2SpellSlots"},
  		{"name": "Level 3 Spell Slots", "variableName": "level3SpellSlots"},
  		{"name": "Level 4 Spell Slots", "variableName": "level4SpellSlots"},
  		{"name": "Level 5 Spell Slots", "variableName": "level5SpellSlots"},
  		{"name": "Level 6 Spell Slots", "variableName": "level6SpellSlots"},
  		{"name": "Level 7 Spell Slots", "variableName": "level7SpellSlots"},
  		{"name": "Level 8 Spell Slots", "variableName": "level8SpellSlots"},
  		{"name": "Level 9 Spell Slots", "variableName": "level9SpellSlots"},
  	],
  	"utility": [
  		{"name": "Carry Capacity Multiplier", "variableName": "carryMultiplier"},
  		{"name": "Rage Damage", "variableName": "rageDamage"},
  	],
  },

  "skills": {
    "skill": [
      {"name": "Acrobatics", "variableName": "acrobatics", "ability": "dexterity"},
      {"name": "Animal Handling", "variableName": "animalHandling", "ability": "wisdom"},
      {"name": "Arcana", "variableName": "arcana", "ability": "intelligence"},
      {"name": "Athletics", "variableName": "athletics", "ability": "strength"},
      {"name": "Deception", "variableName": "deception", "ability": "charisma"},
      {"name": "History", "variableName": "history", "ability": "intelligence"},
      {"name": "Insight", "variableName": "insight", "ability": "wisdom"},
      {"name": "Intimidation", "variableName": "intimidation", "ability": "charisma"},
      {"name": "Investigation", "variableName": "investigation", "ability": "intelligence"},
      {"name": "Medicine", "variableName": "medicine", "ability": "wisdom"},
      {"name": "Nature", "variableName": "nature", "ability": "intelligence"},
      {"name": "Perception", "variableName": "perception", "ability": "wisdom"},
      {"name": "Performance", "variableName": "performance", "ability": "charisma"},
      {"name": "Persuasion", "variableName": "persuasion", "ability": "charisma"},
      {"name": "Religion", "variableName": "religion", "ability": "intelligence"},
      {"name": "Sleight of Hand", "variableName": "sleightOfHand", "ability": "dexterity"},
      {"name": "Stealth", "variableName": "stealth", "ability": "dexterity"},
      {"name": "Survival", "variableName": "survival", "ability": "wisdom"},
    ],
    "save": [
      {"name": "Strength Save", "variableName": "strengthSave", "ability": "strength"},
      {"name": "Dexterity Save", "variableName": "dexteritySave", "ability": "dexterity"},
      {"name": "Constitution Save", "variableName": "constitutionSave", "ability": "constitution"},
      {"name": "Intelligence Save", "variableName": "intelligenceSave", "ability": "intelligence"},
      {"name": "Wisdom Save", "variableName": "wisdomSave", "ability": "wisdom"},
      {"name": "Charisma Save", "variableName": "charismaSave", "ability": "charisma"},
    ],
    "stat": [
      {"name": "Proficiency Bonus", "variableName": "proficiencyBonus"},
      {"name": "initiative", "variableName": "initiative"},
    ],
    "utility": [
      {"name": "Dexterity Armor", "variableName": "dexterityArmor", "ability": "dexterity"},
    ],
  },

  "damageMultipliers": [
    {"name": "Acid Multiplier", "variableName":"acidMultiplier"},
    {"name": "Bludgeoning Multiplier", "variableName":"bludgeoningMultiplier"},
    {"name": "Cold Multiplier", "variableName":"coldMultiplier"},
    {"name": "Fire Multiplier", "variableName":"fireMultiplier"},
    {"name": "Force Multiplier", "variableName":"forceMultiplier"},
    {"name": "Lightning Multiplier", "variableName":"lightningMultiplier"},
    {"name": "Necrotic Multiplier", "variableName":"necroticMultiplier"},
    {"name": "Piercing Multiplier", "variableName":"piercingMultiplier"},
    {"name": "Poison Multiplier", "variableName":"poisonMultiplier"},
    {"name": "Psychic Multiplier", "variableName":"psychicMultiplier"},
    {"name": "Radiant Multiplier", "variableName":"radiantMultiplier"},
    {"name": "Slashing Multiplier", "variableName":"slashingMultiplier"},
    {"name": "Thunder Multiplier", "variableName":"thunderMultiplier"},
  ]
}
