import SimpleSchema from 'simpl-schema';
import AdjustmentSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
import { ActionSchema } from '/imports/api/properties/Actions.js';

// Attacks are special instances of actions
let AttackSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend({
    // What gets added to the d20 roll
    rollBonus: {
      type: String,
      optional: true,
    },
    // What damage does it do to the targets
    adjustments: {
      type: Array,
      defaultValue: [],
    },
    'adjustments.$': {
      type: AdjustmentSchema,
    },
    // If set reference an item whose quantity is reduced by 1 every time this
    // attack is rolled
    ammunition: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
    // Set better defaults for the action
    type: {
      defaultValue: 'attack',
    },
    tags: {
      defaultValue: ['attack'],
    },
  });

export { AttackSchema };
