const PROPERTIES = Object.freeze({
  action: {
    icon: 'offline_bolt',
    name: 'Action'
  },
  adjustment: {
    icon: 'warning',
    name: 'Attribute damage'
  },
  attack: {
    icon: 'bolt',
    name: 'Attack'
  },
  attribute: {
    icon: 'donut_small',
    name: 'Attribute'
  },
  buff: {
    icon: 'star',
    name: 'Buff'
  },
  classLevel: {
    icon: 'school',
    name: 'Class level'
  },
  damage: {
    icon: 'report',
    name: 'Damage'
  },
  damageMultiplier: {
    icon: 'layers',
    name: 'Damage multiplier'
  },
  effect: {
    icon: 'show_chart',
    name: 'Effect'
  },
  experience: {
    icon: 'add',
    name: 'Experience'
  },
  feature: {
    icon: 'subject',
    name: 'Feature'
  },
  folder: {
    icon: 'folder',
    name: 'Folder'
  },
  note: {
    icon: 'note',
    name: 'Note'
  },
  proficiency: {
    icon: 'radio_button_checked',
    name: 'Proficiency'
  },
  roll: {
    icon: 'flare',
    name: 'Roll'
  },
  savingThrow: {
    icon: 'all_out',
    name: 'Saving throw'
  },
  skill: {
    icon: 'check_box',
    name: 'Skill'
  },
  spellList: {
    icon: 'list',
    name: 'Spell list'
  },
  spell: {
    icon: 'whatshot',
    name: 'Spell'
  },
  container: {
    icon: 'work',
    name: 'Container'
  },
  item: {
    icon: 'category',
    name: 'Item'
  },
  toggle: {
    icon: 'power_settings_new',
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
