import evaluateAndRollString from '/imports/api/creature/computation/afterComputation/evaluateAndRollString.js';

export default function applyDamage({
  prop,
  creature,
  targets,
  actionContext
}){
  let damageTargets = prop.target === 'self' ? [creature] : targets;
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  let {result, errors} = evaluateAndRollString(prop.amount, scope);
  if (Meteor.isClient){
    errors.forEach(e => console.error(e));
    console.log(result);
  }
}
