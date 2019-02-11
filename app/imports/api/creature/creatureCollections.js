import Actions from '/imports/api/creature/properties/Actions.js';
import Attacks from '/imports/api/creature/properties/Attacks.js';
import Attributes from '/imports/api/creature/properties/Attributes.js';
import Buffs from '/imports/api/creature/properties/Buffs.js';
import Bundles from '/imports/api/creature/properties/Bundles.js';
import Classes from '/imports/api/creature/properties/Classes.js';
import Conditions from '/imports/api/creature/properties/Conditions.js';
import CustomBuffs from '/imports/api/creature/properties/CustomBuffs.js';
import DamageMultipliers from '/imports/api/creature/properties/DamageMultipliers.js';
import Effects from '/imports/api/creature/properties/Effects.js';
import Experiences from '/imports/api/creature/properties/Experiences.js';
import Features from '/imports/api/creature/properties/Features.js';
import Notes from '/imports/api/creature/properties/Notes.js';
import Proficiencies from '/imports/api/creature/properties/Proficiencies.js';
import Skills from '/imports/api/creature/properties/Skills.js';
import SpellLists from '/imports/api/creature/properties/SpellLists.js';
import Spells from '/imports/api/creature/properties/Spells.js';
import Containers from '/imports/api/inventory/Containers.js';
import Items from '/imports/api/inventory/Items.js';

// All theses collections have the field {charId: String}
// Collate them here in case we need to do something on all the collections of
// a creature

export default [
  Actions,
  Attacks,
  Attributes,
  Buffs,
  Bundles,
  Classes,
  Conditions,
  CustomBuffs,
  DamageMultipliers,
  Effects,
  Experiences,
  Features,
  Notes,
  Proficiencies,
  Skills,
  SpellLists,
  Spells,
  Containers,
  Items,
];
