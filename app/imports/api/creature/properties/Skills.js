import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/recomputeCreatureMixin.js';
import { creaturePermissionMixin } from '/imports/api/creature/creaturePermissions.js';
import { setDocToLastMixin } from '/imports/api/order.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/simpleSchemaMixin.js';

let Skills = new Mongo.Collection("skills");

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills have an ability score modifier that they use as their basis
 */
let SkillSchema = schema({
  name: {
		type: String,
		optional: true,
	},
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
		regEx: /^\w*[a-z]\w*$/i,
  },
	// The variable name of the ability this skill relies on
  ability: {
    type: String,
    optional: true,
  },
	// What type of skill is this
  type: {
    type: String,
    allowedValues: [
      "skill",
      "save",
			"check",
      "tool",
      "weapon",
      "language",
			"utility", //not displayed anywhere
    ],
  },
	// If the baseValue is higher than the computed value, it will be used as `value`
	baseValue: {
		type: Number,
		optional: true,
	},
	// The base proficiency of this skill
	baseProficiency: {
		type: Number,
		optional: true,
	},
});

SkillSchema.extend(ColorSchema);

let ComputedSkillSchema = schema({
	// Computed value of skill to be added to skill rolls
  value: {
    type: Number,
		defaultValue: 0,
  },
	// Computed value added by the ability
	abilityMod: {
		type: SimpleSchema.Integer,
		optional: true,
	},
	// Computed advantage/disadvantage
  advantage: {
    type: SimpleSchema.Integer,
    optional: true,
    allowedValues: [-1, 0, 1],
  },
	// Computed bonus to passive checks
  passiveBonus: {
    type: Number,
    optional: true,
  },
	// Computed proficiency multiplier
  proficiency: {
    type: Number,
    allowedValues: [0, 0.5, 1, 2],
		defaultValue: 0,
  },
	// Computed number of total conditional benefits
  conditionalBenefits: {
    type: SimpleSchema.Integer,
    optional: true,
  },
	// Computed number of things forcing this skill to fail
  fail: {
    type: SimpleSchema.Integer,
    optional: true,
  },
}).extend(SkillSchema);

Skills.attachSchema(ComputedSkillSchema);
Skills.attachSchema(PropertySchema);
Skills.attachSchema(ChildSchema);

const insertSkill = new ValidatedMethod({
  name: 'Skills.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    recomputeCreatureMixin,
    simpleSchemaMixin,
  ],
  collection: Skills,
  permission: 'edit',
  schema: SkillSchema,
  run(skill) {
		return Skills.insert(skill);
  },
});

const updateSkill = new ValidatedMethod({
  name: 'Skills.methods.update',
  mixins: [
    creaturePermissionMixin,
    recomputeCreatureMixin,
    simpleSchemaMixin,
  ],
  collection: Skills,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    update: SkillSchema.omit('name'),
  }),
  run({_id, update}) {
		return Skills.update(_id, {$set: update});
  },
});

export default Skills;
export { SkillSchema };
