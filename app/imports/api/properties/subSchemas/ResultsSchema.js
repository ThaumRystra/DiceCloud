import SimpleSchema from 'simpl-schema';

import AdjustmentSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
import DamageSchema from '/imports/api/properties/subSchemas/DamageSchema.js';
import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

let ResultsSchema = new SimpleSchema({
  // Adjustments applied when taking this action
  // Ideally, if these adjustments can't be made, the action should be unusable
  adjustments: {
    type: Array,
    defaultValue: [],
  },
  'adjustments.$': {
    type: AdjustmentSchema,
  },
  // Damage is done to hitpoints or hitpoint-like stats
  // has a damage type, can be mitigated by resistances, etc.
  damages: {
    type: Array,
    defaultValue: [],
  },
  'damages.$': {
    type: DamageSchema,
  },
  // Buffs applied when taking this action
  buffs: {
    type: Array,
    defaultValue: [],
  },
  'buffs.$': {
    type: StoredBuffWithIdSchema,
  },
});

export default ResultsSchema;
