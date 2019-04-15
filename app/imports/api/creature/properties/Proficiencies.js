import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/mixins/recomputeCreatureMixin.js';
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Proficiencies = new Mongo.Collection("proficiencies");

let ProficiencySchema = schema({
	name: {
		type: String,
		optional: true,
	},
	// A number representing how proficient the character is
	value: {
		type: Number,
		allowedValues: [0, 0.5, 1, 2],
		defaultValue: 1,
	},
	// The variableName of the skill to apply this to
	skill: {
		type: String,
		optional: true,
	},
});

Proficiencies.attachSchema(ProficiencySchema);
Proficiencies.attachSchema(PropertySchema);

const insertProficiency = new ValidatedMethod({
  name: 'Proficiencies.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		recomputeCreatureMixin,
    simpleSchemaMixin,
  ],
  collection: Proficiencies,
  permission: 'edit',
  schema: ProficiencySchema,
  run(prof) {
		return Proficiencies.insert(prof);
  },
});

const updateProficiency = new ValidatedMethod({
  name: 'Proficiencies.methods.update',
  mixins: [
		recomputeCreatureMixin,
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Proficiencies,
  permission: 'edit',
  schema: ProficiencySchema,
  skipRecompute({update}){
    let fields = getModifierFields(update);
    return !fields.hasAny([
      'value',
      'skill',
    ]);
  },
});

export default Proficiencies;
export { ProficiencySchema, insertProficiency, updateProficiency };
