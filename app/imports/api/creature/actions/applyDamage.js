import evaluateAndRollString from '/imports/api/creature/computation/afterComputation/evaluateAndRollString.js';

//if (Meteor.isServer){
//  var sendWebhook = require('/imports/server/discord/webhook.js').default;
//}

export default function applyDamage({
  prop,
  creature,
  //targets,
  actionContext
}){
  //let damageTargets = prop.target === 'self' ? [creature] : targets;
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  let {result, errors} = evaluateAndRollString(prop.amount, scope);
  if (Meteor.isClient){
    errors.forEach(e => console.error(e));
    console.log(`${result} ${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`);
  }
  //if (Meteor.isServer) sendWebhook({
  //  webhook: creature.webhook,
  //  message: `${result} ${prop.damageType}${prop.damageType !== 'healing'? ' damage': ''}`,
  //});
}
