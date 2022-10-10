import SimpleSchema from 'simpl-schema';

const DeathSavesSchema = new SimpleSchema({
  pass: {
    type: SimpleSchema.Integer,
    min: 0,
    max: 3,
    defaultValue: 0,
  },
  fail: {
    type: SimpleSchema.Integer,
    min: 0,
    max: 3,
    defaultValue: 0,
  },
  canDeathSave: {
    type: Boolean,
    defaultValue: true,
  },
  stable: {
    type: Boolean,
    defaultValue: false,
  },
});

export default DeathSavesSchema;
