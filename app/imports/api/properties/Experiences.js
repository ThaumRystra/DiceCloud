import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/properties/Properties.js'
import recomputeCreatureXP from '/imports/api/creature/creatureComputation.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/mixins/recomputeCreatureMixin.js';
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Experiences = new Mongo.Collection("experience");

let ExperienceSchema = schema({
	title: {
		type: String,
		optional: true,
	},
	// Potentially long description of the event
	description: {
		type: String,
		optional: true,
	},
	// The amount of XP this experience gives
	value: {
		type: SimpleSchema.Integer,
		optional: true,
	},
	// The real-world date that it occured
	date: {
		type: Date,
		autoValue: function() {
			// If the date isn't set, set it to now
			if (!this.isSet) {
				return new Date();
			}
		},
	},
	// The date in-world of this event
	worldDate: {
		type: String,
		optional: true,
	},
});

Experiences.attachSchema(ExperienceSchema);
Experiences.attachSchema(PropertySchema);

const insertExperience = new ValidatedMethod({
  name: 'Experiences.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		recomputeCreatureMixin,
		setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Experiences,
  permission: 'edit',
  schema: ExperienceSchema,
	skipRecompute(experience){
		return !experience.value;
	},
  run(experience) {
		let result = Experiences.insert(experience);
		if (experience.value){
			recomputeCreatureXP(charId);
		}
		return result;
  },
});

const updateExperience = new ValidatedMethod({
  name: 'Experiences.methods.update',
  mixins: [
		recomputeCreatureMixin,
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Experiences,
  permission: 'edit',
  schema: ExperienceSchema,
	skipRecompute({update}){
		return !('value' in update);
	},
  run({_id, update, charId}) {
		let result = Experiences.update(_id, {$set: update});
		if ('value' in update){
			recomputeCreatureXP(charId);
		}
		return result;
  },
});

export default Experiences;
export { ExperienceSchema, insertExperience, updateExperience };
