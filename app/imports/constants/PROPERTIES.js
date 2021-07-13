const PROPERTIES = Object.freeze({
  action: {
    icon: '$vuetify.icons.action',
    name: 'Action'
  },
  attack: {
    icon: '$vuetify.icons.attack',
    name: 'Attack'
  },
  attribute: {
    icon: '$vuetify.icons.attribute',
    name: 'Attribute'
  },
  adjustment: {
    icon: '$vuetify.icons.attribute_damage',
    name: 'Attribute damage'
  },
  buff: {
    icon: '$vuetify.icons.buff',
    name: 'Buff'
  },
  classLevel: {
    icon: '$vuetify.icons.class_level',
    name: 'Class level'
  },
  constant: {
    icon: 'mdi-anchor',
    name: 'Constant'
  },
  container: {
    icon: 'mdi-bag-personal-outline',
    name: 'Container'
  },
  damage: {
    icon: '$vuetify.icons.damage',
    name: 'Damage'
  },
  damageMultiplier: {
    icon: '$vuetify.icons.damage_multiplier',
    name: 'Damage multiplier'
  },
  effect: {
    icon: '$vuetify.icons.effect',
    name: 'Effect'
  },
  feature: {
    icon: 'mdi-text-subject',
    name: 'Feature'
  },
  folder: {
    icon: 'mdi-folder-outline',
    name: 'Folder'
  },
  item: {
    icon: 'mdi-cube-outline',
    name: 'Item'
  },
  note: {
    icon: 'mdi-note-outline',
    name: 'Note'
  },
  proficiency: {
    icon: 'mdi-brightness-1',
    name: 'Proficiency'
  },
  roll: {
    icon: '$vuetify.icons.roll',
    name: 'Roll'
  },
  reference: {
    icon: 'mdi-vector-link',
    name: 'Reference',
    libraryOnly: true,
  },
  savingThrow: {
    icon: '$vuetify.icons.saving_throw',
    name: 'Saving throw'
  },
  skill: {
    icon: '$vuetify.icons.skill',
    name: 'Skill'
  },
  propertySlot: {
    icon: 'mdi-power-socket-eu',
    name: 'Slot'
  },
  slotFiller: {
    icon: 'mdi-power-plug-outline',
    name: 'Slot filler'
  },
  spellList: {
    icon: '$vuetify.icons.spell_list',
    name: 'Spell list'
  },
  spell: {
    icon: '$vuetify.icons.spell',
    name: 'Spell'
  },
  toggle: {
    icon: '$vuetify.icons.toggle',
    name: 'Toggle'
  },
});

export default PROPERTIES;

export function getPropertyName(type){
  return type && PROPERTIES[type] && PROPERTIES[type].name;
}

export function getPropertyIcon(type){
  return type && PROPERTIES[type] && PROPERTIES[type].icon;
}
