import SimpleSchema from 'simpl-schema';

/*
 * RollModifiers are reason-value attached to rolls
 * that modify their final value in some way
 * These are separate from effects because they never cause a recomputation
 * themselves
 */
let RollModifierSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	operation: {
		type: String,
		defaultValue: 'rollBonus',
		allowedValues: [
			'rollBonus',
			'damageBonus',
			'advantage',
		],
	},
	calculation: {
		type: String,
		optional: true,
	},
	// which tags the modifier is applied to
  // all tags must match
	'tags.$': {
		type: String,
		optional: true,
	},
});

const StoredRollModifierSchema = new SimpleSchema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
			autoValue(){
				if (!this.isSet) return Random.id();
			}
		},
}).extend(RollModifierSchema);

const ComputedRollModifierSchema = new SimpleSchema({
	// The computed result of the effect
	result: {
		type: SimpleSchema.oneOf(Number, String),
		optional: true,
	},
}).extend(RollModifierSchema);

export { RollModifierSchema, StoredRollModifierSchema, ComputedRollModifierSchema };
