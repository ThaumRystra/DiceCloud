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
    // Set better defaults for the action
    actionType: {
      type: String,
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
