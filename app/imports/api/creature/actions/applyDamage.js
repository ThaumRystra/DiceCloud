import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

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
  let {result, errors} = evaluateString(prop.amount, scope);
  if (Meteor.isClient) errors.forEach(e => console.error(e));
  if (Number.isFinite(result)) {
    damageTargets.forEach()
  }
}
