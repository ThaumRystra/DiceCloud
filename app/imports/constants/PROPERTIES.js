const PROPERTIES = Object.freeze({
  action: {
    icon: '$vuetify.icons.action',
    name: 'Action',
    docsPath: 'property/action',
    helpText: 'Actions are things your character can do. When an action is taken, all the properties under it are activated.',
    suggestedParents: ['classLevel', 'feature', 'item'],
  },
  attribute: {
    icon: '$vuetify.icons.attribute',
    name: 'Attribute',
    docsPath: 'property/attribute',
    helpText: 'Attributes are the numbered statistics of your character, excluding rolls you might add proficiency bonus to, those are skills.',
    examples: 'Ability scores, speed, hit points, ki',
    suggestedParents: ['classLevel', 'buff'],
  },
  adjustment: {
    icon: '$vuetify.icons.attribute_damage',
    name: 'Attribute damage',
    docsPath: 'property/attribute-damage',
    helpText: 'Attribute damage reduces the current value of an attribute when it is applied by an action. A negative value causes the attribute to increase instead, up to its normal maximum.',
    suggestedParents: ['action', 'attack', 'savingThrow', 'spell', 'branch'],
  },
  buff: {
    icon: '$vuetify.icons.buff',
    name: 'Buff',
    docsPath: 'property/buff',
    helpText: 'When a buff is activated as a child of an action, it will copy the properties under itself onto a target character.',
    suggestedParents: ['action', 'attack', 'savingThrow', 'spell', 'branch'],
  },
  buffRemover: {
    icon: '$vuetify.icons.buffRemover',
    name: 'Remove Buff',
    docsPath: 'property/remove-buff',
    helpText: 'Removes a buff from the target character',
    suggestedParents: ['action', 'attack', 'savingThrow', 'spell', 'branch'],
  },
  branch: {
    icon: 'mdi-file-tree',
    name: 'Branch',
    docsPath: 'property/branch',
    helpText: 'When a branch is activated as a child of an action, it can control which of its children get activated.',
    suggestedParents: ['action', 'attack', 'savingThrow', 'spell'],
  },
  class: {
    icon: 'mdi-card-account-details',
    name: 'Class',
    docsPath: 'property/class',
    helpText: 'Your character should ideally have one starting class. Classes hold class levels',
    suggestedParents: [],
  },
  classLevel: {
    icon: '$vuetify.icons.class_level',
    name: 'Class level',
    docsPath: 'property/class-level',
    helpText: 'Class levels represent a single level gained in a class',
    suggestedParents: ['class'],
  },
  constant: {
    icon: 'mdi-anchor',
    name: 'Constant',
    docsPath: 'property/constant',
    helpText: 'A constant can define a static value that can be used in calculations elsewhere in the sheet',
    suggestedParents: [],
  },
  container: {
    icon: 'mdi-bag-personal-outline',
    name: 'Container',
    docsPath: 'property/container',
    helpText: 'A container holds items in the inventory',
    examples: 'Coin pouch, backpack',
    suggestedParents: ['folder'],
  },
  creature: {
    icon: 'mdi-account',
    name: 'Creature',
    docsPath: 'property/creature',
    helpText: 'A creature is a template for a creature that might become a real creature once added to a tabletop or summoned by a character',
    examples: 'Monsters, raised undead',
    suggestedParents: [],
  },
  damage: {
    icon: '$vuetify.icons.damage',
    name: 'Damage',
    docsPath: 'property/damage',
    helpText: 'When damage is activated by an action it reduces the hit points of the target creature by the calculated amount.',
    suggestedParents: ['action', 'attack', 'savingThrow', 'spell', 'branch'],
  },
  damageMultiplier: {
    icon: '$vuetify.icons.damage_multiplier',
    name: 'Damage multiplier',
    docsPath: 'property/damage-multiplier',
    helpText: 'Resistance, vulnerability, and immunity.',
    suggestedParents: ['classLevel', 'feature', 'item'],
  },
  effect: {
    icon: '$vuetify.icons.effect',
    name: 'Effect',
    docsPath: 'property/effect',
    helpText: 'Effects change the value or state of attributes and skills.',
    examples: '+2 Strength, Advantage on dexterity saving throws',
    suggestedParents: ['buff', 'classLevel', 'feature', 'folder', 'item'],
  },
  feature: {
    icon: 'mdi-text-subject',
    name: 'Feature',
    docsPath: 'property/feature',
    helpText: 'Descriptive or narrative features your character has access to',
    suggestedParents: ['classLevel', 'folder'],
  },
  folder: {
    icon: 'mdi-folder-outline',
    name: 'Folder',
    docsPath: 'property/feature',
    helpText: 'A way to organise other properties on the character',
    suggestedParents: ['action', 'folder'],
  },
  item: {
    icon: 'mdi-cube-outline',
    name: 'Item',
    docsPath: 'property/item',
    helpText: 'Objects and equipment your charcter finds on their adventures',
    suggestedParents: ['container'],
  },
  note: {
    icon: 'mdi-note-outline',
    name: 'Note',
    docsPath: 'property/note',
    helpText: 'Notes about your character and their adventures',
    suggestedParents: ['note', 'folder'],
  },
  pointBuy: {
    icon: 'mdi-table',
    name: 'Point Buy',
    docsPath: 'property/point-buy',
    helpText: 'A point buy table that allows the user to select an array of values that match a given cost',
    suggestedParents: [],
  },
  proficiency: {
    icon: 'mdi-brightness-1',
    name: 'Proficiency',
    docsPath: 'property/proficiency',
    helpText: 'Proficiencies apply your proficiency bonus to skills already on your character sheet.',
    suggestedParents: ['buff', 'classLevel', 'feature', 'folder'],
  },
  roll: {
    icon: '$vuetify.icons.roll',
    name: 'Roll',
    docsPath: 'property/roll',
    helpText: 'When activated by an action, rolls perform a calculation and temporarily store the result for other properties under the same action to use',
    suggestedParents: ['action', 'attack', 'savingThrow', 'spell', 'branch'],
  },
  reference: {
    icon: 'mdi-vector-link',
    name: 'Reference',
    libraryOnly: true,
    helpText: 'A reference is a link to a different property in a library. When a reference gets copied to a character sheet, it is replaced with the referenced property and all its children.',
    suggestedParents: [],
  },
  savingThrow: {
    icon: '$vuetify.icons.saving_throw',
    name: 'Saving throw',
    docsPath: 'property/saving-throw',
    helpText: 'When a saving throw is activated by an action, it causes the target to make a saving throw, if the saving throw fails, the children properties of the saving throw are activated.',
    suggestedParents: ['action', 'attack', 'spell'],
  },
  skill: {
    icon: '$vuetify.icons.skill',
    name: 'Skill',
    docsPath: 'property/skill',
    helpText: 'Skills, saves, languages, and weapon and tool proficiencies are all skills. Skills can have a default proficiency set. Proficiencies and effects can change the value and state of skills.',
    suggestedParents: ['classLevel', 'folder'],
  },
  propertySlot: {
    icon: 'mdi-power-socket-eu',
    name: 'Slot',
    docsPath: 'property/slot',
    helpText: 'A slot in the character sheet is used to specify that a property needs to be selected from a library to fill the slot. The slot can determine what tags it is looking for, and any subscribed library property with matching tags can fill the slot',
    suggestedParents: [],
  },
  spellList: {
    icon: '$vuetify.icons.spell_list',
    name: 'Spell list',
    docsPath: 'property/spell-list',
    helpText: 'A list of spells on your character sheet. It can provide a DC and spell attack bonus to the spells within',
    suggestedParents: [],
  },
  spell: {
    icon: '$vuetify.icons.spell',
    name: 'Spell',
    docsPath: 'property/spell',
    helpText: 'A spell your character can potentially cast',
    suggestedParents: ['spellList'],
  },
  toggle: {
    icon: '$vuetify.icons.toggle',
    name: 'Toggle',
    docsPath: 'property/toggle',
    helpText: 'Togggles allow parts of the character sheet to be turned on and off, either manually or as the result of a calculation.',
    suggestedParents: [],
  },
  trigger: {
    icon: 'mdi-electric-switch',
    name: 'Trigger',
    docsPath: 'property/trigger',
    helpText: 'Triggers apply their children in response to events on the character sheet, such as taking an action or receiving damage',
    suggestedParents: [],
  },
});

export default PROPERTIES;

export function getPropertyName(type) {
  return (type && PROPERTIES[type] && PROPERTIES[type].name) || type;
}

export function getPropertyIcon(type) {
  return type && PROPERTIES[type] && PROPERTIES[type].icon;
}

export function getSuggestedChildren(type) {
  const suggestions = [];
  for (const key in PROPERTIES) {
    const prop = PROPERTIES[key];
    if (prop.suggestedParents.includes(type)) {
      suggestions.push({ type: key, details: prop });
    }
  }
  return suggestions;
}

const propsByDocsPath = new Map();

for (const key in PROPERTIES) {
  const prop = PROPERTIES[key];
  if (prop.docsPath) {
    propsByDocsPath.set(prop.docsPath, {
      ...prop,
      type: key,
    });
  }
}

export { propsByDocsPath };
