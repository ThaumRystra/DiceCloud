import SimpleSchema from 'simpl-schema';

// These are the rolls made when saves are called for
// For the saving throw bonus or proficiency, see ./Skills.js
let SavingThrowSchema = new SimpleSchema ({
  name: {
    type: String,
    optional: true,
  },
  dc: {
    type: String,
    optional: true,
  },
  // The variable name of ability the save to roll
  stat: {
    type: String,
    optional: true,
  },
});

export { SavingThrowSchema };
