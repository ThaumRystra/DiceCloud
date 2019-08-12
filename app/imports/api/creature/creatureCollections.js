import Actions from '/imports/api/properties/Actions.js';
import Attributes from '/imports/api/properties/Attributes.js';
import Buffs from '/imports/api/properties/Buffs.js';
import ClassLevels from '/imports/api/properties/ClassLevels.js';
import DamageMultipliers from '/imports/api/properties/DamageMultipliers.js';
import Effects from '/imports/api/properties/Effects.js';
import Experiences from '/imports/api/properties/Experiences.js';
import Features from '/imports/api/properties/Features.js';
import Folders from '/imports/api/properties/Folders.js';
import Notes from '/imports/api/properties/Notes.js';
import Proficiencies from '/imports/api/properties/Proficiencies.js';
import Rolls from '/imports/api/properties/Rolls.js';
import Skills from '/imports/api/properties/Skills.js';
import SpellLists from '/imports/api/properties/SpellLists.js';
import Spells from '/imports/api/properties/Spells.js';
import Containers from '/imports/api/properties/Containers.js';
import Items from '/imports/api/properties/Items.js';

// All theses collections have the field {charId: String}
// Collate them here in case we need to do something on all the collections of
// a creature

let creatureCollections = [
  Actions,
  Attributes,
  Buffs,
  ClassLevels,
  DamageMultipliers,
  Effects,
  Experiences,
  Features,
  Folders,
  Notes,
  Proficiencies,
  Rolls,
  Skills,
  SpellLists,
  Spells,
  Containers,
  Items,
];

export default creatureCollections;
