import { CreatureSchema } from '/imports/api/creature/properties/Creatures.js';
import { ActionSchema } from '/imports/api/creature/properties/Actions.js';
import { AttributeSchema } from '/imports/api/creature/properties/Attributes.js';
import { ClassSchema } from '/imports/api/creature/properties/Classes.js';
import { ClassLevelSchema } from '/imports/api/creature/properties/ClassLevels.js';
import { DamageMultiplierSchema } from '/imports/api/creature/properties/DamageMultipliers.js';
import { EffectSchema } from '/imports/api/creature/properties/Effects.js';
import { ExperienceSchema } from '/imports/api/creature/properties/Experiences.js';
import { FeatureSchema } from '/imports/api/creature/properties/Features.js';
import { FolderSchema } from '/imports/api/creature/properties/Folders.js';
import { NoteSchema } from '/imports/api/creature/properties/Notes.js';
import { ProficiencySchema } from '/imports/api/creature/properties/Proficiencies.js';
import { SkillSchema } from '/imports/api/creature/properties/Skills.js';
import { SpellListSchema } from '/imports/api/creature/properties/SpellLists.js';
import { SpellSchema } from '/imports/api/creature/properties/Spells.js';
import { ContainerSchema } from '/imports/api/creature/properties/Containers.js';
import { ItemSchema } from '/imports/api/creature/properties/Items.js';


const librarySchemas = {
  creature: CreatureSchema,
  action: ActionSchema,
  attribute: AttributeSchema,
  class: ClassSchema,
  classLevel: ClassLevelSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: EffectSchema,
  experience: ExperienceSchema,
  feature: FeatureSchema,
  folder: FolderSchema,
  note: NoteSchema,
  proficiency: ProficiencySchema,
  skill: SkillSchema,
  spellList: SpellListSchema,
  spell: SpellSchema,
  container: ContainerSchema,
  item: ItemSchema,
};

export default librarySchemas;
