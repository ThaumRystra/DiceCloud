const PROPERTIES = Object.freeze({
  action: {
    icon: '$vuetify.icons.action',
    name: 'Action',
    helpText: 'Actions are things your character can do. When an action is taken, all the properties under it are applied.'
  },
  attack: {
    icon: '$vuetify.icons.attack',
    name: 'Attack',
    helpText: 'Attacks are a special form of action that includes an attack roll. Attacks can critical hit, which doubles the number of damage dice in properties under the attack.',
  },
  attribute: {
    icon: '$vuetify.icons.attribute',
    name: 'Attribute',
    helpText: 'Attributes are the numbered statistics of your character, excluding rolls you might add proficiency bonus to, those are skills.',
    examples: 'Ability scores, speed, hit points, ki'
  },
  adjustment: {
    icon: '$vuetify.icons.attribute_damage',
    name: 'Attribute damage',
    helpText: 'Attribute damage reduces the current value of an attribute when it is applied by an action. A negative value causes the attribute to increase instead, up to its normal maximum.'
  },
  buff: {
    icon: '$vuetify.icons.buff',
    name: 'Buff',
    helpText: 'When a buff is activated as a child of an action, it will copy the properties under itself onto a target character.'
  },
  classLevel: {
    icon: '$vuetify.icons.class_level',
    name: 'Class level',
    helpText: 'Class levels represent a single level gained in a class'
  },
  constant: {
    icon: 'mdi-anchor',
    name: 'Constant',
    helpText: 'A constant can define a static value that can be used in calculations elsewhere in the sheet'
  },
  container: {
    icon: 'mdi-bag-personal-outline',
    name: 'Container',
    helpText: 'A container holds items in the inventory',
    examples: 'Coin pouch, backpack'
  },
  damage: {
    icon: '$vuetify.icons.damage',
    name: 'Damage',
    helpText: 'When damage is applied by an action it reduces the hit points of the target creature by the calculated amount.'
  },
  damageMultiplier: {
    icon: '$vuetify.icons.damage_multiplier',
    name: 'Damage multiplier',
    helpText: 'Resistance, vulnerability, and immunity.'
  },
  effect: {
    icon: '$vuetify.icons.effect',
    name: 'Effect',
    helpText: 'Effects change the value or state of attributes and skills.',
    examples: '+2 Strength, Advantage on dexterity saving throws',
  },
  feature: {
    icon: 'mdi-text-subject',
    name: 'Feature',
    helpText: 'Descriptive or narrative features your character has access to'
  },
  folder: {
    icon: 'mdi-folder-outline',
    name: 'Folder',
    helpText: 'A way to organise other properties on the character',
  },
  item: {
    icon: 'mdi-cube-outline',
    name: 'Item',
    helpText: 'Objects and equipment your charcter finds on their adventures'
  },
  note: {
    icon: 'mdi-note-outline',
    name: 'Note',
    helpText: 'Notes about your character and their adventures'
  },
  proficiency: {
    icon: 'mdi-brightness-1',
    name: 'Proficiency',
    helpText: 'Proficiencies apply your proficiency bonus to skills already on your character sheet.'
  },
  roll: {
    icon: '$vuetify.icons.roll',
    name: 'Roll',
    helpText: 'When activated by an action, rolls perform a calculation and temporarily store the result for other properties under the same action to use'
  },
  reference: {
    icon: 'mdi-vector-link',
    name: 'Reference',
    libraryOnly: true,
    helpText: 'A reference is a link to a different property in a library. When a reference gets copied to a character sheet, it is replaced with the referenced property and all its children.'
  },
  savingThrow: {
    icon: '$vuetify.icons.saving_throw',
    name: 'Saving throw',
    helpText: 'When a saving throw is activated by an action, it causes the target to make a saving throw, if the saving throw fails, the children properties of the saving throw are activated.'
  },
  skill: {
    icon: '$vuetify.icons.skill',
    name: 'Skill',
    helpText: 'Skills, saves, languages, and weapon and tool proficiencies are all skills. Skills can have a default proficiency set. Proficiencies and effects can change the value and state of skills.'
  },
  propertySlot: {
    icon: 'mdi-power-socket-eu',
    name: 'Slot',
    helpText: 'A slot in the character sheet is used to specify that a property needs to be selected from a library to fill the slot. The slot can determine what tags it is looking for, and any subscribed library property with matching tags can fill the slot'
  },
  slotFiller: {
    icon: 'mdi-power-plug-outline',
    name: 'Slot filler',
    helpText: 'A slot filler allows for more advanced logic when it attemptst to fill a slot. It can masquarade as any property type, and calculate whether it should fill a slot or not.'
  },
  spellList: {
    icon: '$vuetify.icons.spell_list',
    name: 'Spell list',
    helpText: 'A list of spells on your character sheet. It can provide a DC and spell attack bonus to the spells within'
  },
  spell: {
    icon: '$vuetify.icons.spell',
    name: 'Spell',
    helpText: 'A spell your character can potentially cast'
  },
  toggle: {
    icon: '$vuetify.icons.toggle',
    name: 'Toggle',
    helpText: 'Togggles allow parts of the character sheet to be turned on and off, either manually or as the result of a calculation.'
  },
});

export default PROPERTIES;

export function getPropertyName(type){
  return type && PROPERTIES[type] && PROPERTIES[type].name;
}

export function getPropertyIcon(type){
  return type && PROPERTIES[type] && PROPERTIES[type].icon;
}
