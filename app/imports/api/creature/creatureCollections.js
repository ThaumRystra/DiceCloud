import Actions from '/imports/api/creature/properties/Actions.js';
import Attributes from '/imports/api/creature/properties/Attributes.js';
import Buffs from '/imports/api/creature/properties/Buffs.js';
import Classes from '/imports/api/creature/properties/Classes.js';
import ClassLevels from '/imports/api/creature/properties/ClassLevels.js';
import DamageMultipliers from '/imports/api/creature/properties/DamageMultipliers.js';
import Effects from '/imports/api/creature/properties/Effects.js';
import Experiences from '/imports/api/creature/properties/Experiences.js';
import Features from '/imports/api/creature/properties/Features.js';
import Folders from '/imports/api/creature/properties/Folders.js';
import Notes from '/imports/api/creature/properties/Notes.js';
import Proficiencies from '/imports/api/creature/properties/Proficiencies.js';
import Rolls from '/imports/api/creature/properties/Rolls.js';
import Skills from '/imports/api/creature/properties/Skills.js';
import SpellLists from '/imports/api/creature/properties/SpellLists.js';
import Spells from '/imports/api/creature/properties/Spells.js';
import Containers from '/imports/api/inventory/Containers.js';
import Items from '/imports/api/inventory/Items.js';

// All theses collections have the field {charId: String}
// Collate them here in case we need to do something on all the collections of
// a creature

let creatureCollections = [
  Actions,
  Attributes,
  Buffs,
  Classes,
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
