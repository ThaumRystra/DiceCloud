import updateAction from '/imports/api/creature/properties/Actions.js';
import updateAttribute from '/imports/api/creature/properties/Attributes.js';
import updateBuff from '/imports/api/creature/properties/Buff.js';
import updateClass from '/imports/api/creature/properties/Classes.js';
import updateClassLevel from '/imports/api/creature/properties/ClassLevels.js';
import updateDamageMiliplier from '/imports/api/creature/properties/DamageMilipliers.js';
import updateEffect from '/imports/api/creature/properties/Effects.js';
import updateExperience from '/imports/api/creature/properties/Experiences.js';
import updateFeature from '/imports/api/creature/properties/Features.js';
import updateFolder from '/imports/api/creature/properties/Folders.js';
import updateNote from '/imports/api/creature/properties/Notes.js';
import updateProficiency from '/imports/api/creature/properties/Proficiencies.js';
import updateRoll from '/imports/api/creature/properties/Rolls.js';
import updateSkill from '/imports/api/creature/properties/Skills.js';
import updateSpellList from '/imports/api/creature/properties/SpellLists.js';
import updateSpell from '/imports/api/creature/properties/Spells.js';

export default Object.freeze({
  actions: updateAction,
  attributes: updateAttribute,
  buffs: updateBuff,
  classs: updateClass,
  classLevels: updateClassLevel,
  damageMilipliers: updateDamageMiliplier,
  effects: updateEffect,
  experiences: updateExperience,
  features: updateFeature,
  folders: updateFolder,
  notes: updateNote,
  proficienciess: updateProficiency,
  rolls: updateRoll,
  skills: updateSkill,
  spellLists: updateSpellList,
  spells: updateSpell,
});
