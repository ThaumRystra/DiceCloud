import math from '/imports/math.js';
//if (Meteor.isServer){
//  var sendWebhook = require('/imports/server/discord/webhook.js').default;
//}

export default function applyAttack({
  prop,
  //children,
  creature,
  //targets,
  //actionContext
}){
  let result = math.roll(1, 20) + prop.rollBonusResult;
  if (Meteor.isClient){
    console.log(`${creature.name} makes a ${prop.name} attack! Rolls ${result} to hit`);
  }
  //if (Meteor.isServer) sendWebhook({
  //  webhook: creature.webhook,
  //  message: `${creature.name} makes a ${prop.name} attack! Rolls ${result} to hit`,
  //});
}
