import { ActionSchema } from '/imports/api/properties/Actions.js';
import { AttackSchema } from '/imports/api/properties/Attacks.js';
import { AttributeSchema } from '/imports/api/properties/Attributes.js';
import { StoredBuffSchema } from '/imports/api/properties/Buffs.js';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { EffectSchema } from '/imports/api/properties/Effects.js';
import { ExperienceSchema } from '/imports/api/properties/Experiences.js';
import { FeatureSchema } from '/imports/api/properties/Features.js';
import { FolderSchema } from '/imports/api/properties/Folders.js';
import { NoteSchema } from '/imports/api/properties/Notes.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { RollSchema } from '/imports/api/properties/Rolls.js';
import { SavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { SkillSchema } from '/imports/api/properties/Skills.js';
import { SpellListSchema } from '/imports/api/properties/SpellLists.js';
import { SpellSchema } from '/imports/api/properties/Spells.js';
import { ContainerSchema } from '/imports/api/properties/Containers.js';
import { ItemSchema } from '/imports/api/properties/Items.js';

const propertySchemas = {
  action: ActionSchema,
  attack: AttackSchema,
  attribute: AttributeSchema,
  buff: StoredBuffSchema,
  classLevel: ClassLevelSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: EffectSchema,
  experience: ExperienceSchema,
  feature: FeatureSchema,
  folder: FolderSchema,
  note: NoteSchema,
  proficiency: ProficiencySchema,
  roll: RollSchema,
  savingThrow: SavingThrowSchema,
  skill: SkillSchema,
  spellList: SpellListSchema,
  spell: SpellSchema,
  container: ContainerSchema,
  item: ItemSchema,
};

export default propertySchemas;
