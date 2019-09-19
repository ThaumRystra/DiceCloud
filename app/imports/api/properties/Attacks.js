import SimpleSchema from 'simpl-schema';
import { ActionSchema } from '/imports/api/properties/Actions.js';

// Attacks are special instances of actions
let AttackSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend({
    // What gets added to the d20 roll
    rollBonus: {
      type: String,
      defaultValue: 'strength.modifier + proficiencyBonus',
      optional: true,
    },
    // If set reference an item whose quantity is reduced by 1 every time this
    // attack is rolled
    ammunition: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
    // Set better defaults for the action
    actionType: {
      defaultValue: 'attack',
    },
    tags: {
  		type: Array,
      defaultValue: ['attack'],
    },
    'tags.$': {
      type: String,
    },
  });

export { AttackSchema };
