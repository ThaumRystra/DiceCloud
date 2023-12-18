import MONGO_OPERATORS from '/imports/constants/MONGO_OPERATORS';

const hasAny = function (values) {
  for (let value of values) {
    if (this.has(value)) {
      return true;
    }
  }
  return false;
};

// Returns a Set of fields the modifier changes
// The set has been extended with the "hasAny" function
export default function getModifierFields(modifier) {
  let fields = new Set();

  for (let operator of MONGO_OPERATORS) {
    if (modifier[operator]) for (let field in modifier[operator]) {
      const indexOfDot = field.indexOf('.');
      if (indexOfDot !== -1) {
        field = field.substring(0, indexOfDot);
      }
      fields.add(field);
    }
  }
  fields.hasAny = hasAny;
  return fields;
}
